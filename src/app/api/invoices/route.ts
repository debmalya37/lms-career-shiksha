// app/api/invoices/route.ts

import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Invoice from '@/models/invoiceModel';
// import AdmissionForm, { IAdmission } from '@/models/admissionModel';
import Course, { ICourse } from '@/models/courseModel';
import { v4 as uuidv4 } from 'uuid';
import { IPreAdmission } from '@/models/preAdmissionModel';
import preAdmissionModel from '@/models/preAdmissionModel';

export async function POST(req: NextRequest) {
  await connectMongo();
  const body = await req.json();

  const {
    admissionFormId,
    studentName: manualName,
    fatherName: manualFather,
    address1: manualAddress1,
    address2: manualAddress2,
    pincode: manualPincode,
    phone: manualPhone,
    email: manualEmail,
    state: manualState,
    transactionId: manualTxn,
    courseId: manualCourseId,
    originalPrice: manualOriginal,
    discountedPrice: manualDiscounted,
  } = body;

  console.log("Incoming body:", body);

  let studentName: string,
      fatherName: string,
      address1: string,
      address2: string | undefined,
      pincode: number | undefined = undefined, // optional
      phone: string,
      email: string,
      state: string,
      transactionId: string,
      course: ICourse;

       // 0️⃣ Idempotency check: if an invoice with this transactionId already exists, return it
  if (manualTxn) {
    const existing = await Invoice.findOne({
      transactionId: manualTxn,
      ...(admissionFormId && mongoose.isValidObjectId(admissionFormId)
        ? { admissionFormId }
        : {})
    }).lean();
    if (existing) {
      return NextResponse.json({ invoice: existing }, {status: 203});
    }
  }

  // If admin passes a valid admissionFormId, pull from that form:
  if (admissionFormId && mongoose.isValidObjectId(admissionFormId)) {
    const form = await preAdmissionModel.findById(admissionFormId).lean<IPreAdmission>();
    if (!form) {
      return NextResponse.json({ error: 'Admission form not found' }, { status: 404 });
    }
    studentName   = form.name;
    fatherName    = form.fatherName;
    address1      = form.address1;
    address2      = form.address2;
    pincode       = form.pincode ? Number(form.pincode) : undefined; // optional
    phone         = form.phone;        // if your Admission model stores it
    email         = form.email;
    state         = form.state;
    transactionId = form.transactionId || manualTxn || '';

    course = await Course.findById(form.courseId).lean<ICourse>() as ICourse;
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

  } else {
    // No formId → require all manual fields plus a valid courseId
    if (
      !manualName ||
      !manualFather ||
      !manualAddress1 ||
      !manualPincode ||
      !manualPhone ||
      !manualEmail ||
      !manualState ||
      !manualCourseId ||
      !mongoose.isValidObjectId(manualCourseId)
    ) {
      return NextResponse.json(
        {
          error:
            'Provide either a valid admissionFormId or all fields: studentName, fatherName, address1, phone, email, state, and a valid courseId'
        },
        { status: 400 }
      );
    }
    studentName   = manualName;
    fatherName    = manualFather;
    address1      = manualAddress1;
    address2      = manualAddress2;
    pincode       = manualPincode ? Number(manualPincode) : undefined; // optional
    phone         = manualPhone;
    email         = manualEmail;
    state         = manualState;
    transactionId = manualTxn || '';

    course = await Course.findById(manualCourseId).lean<ICourse>() as ICourse;
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
  }

  // Pricing & discount
  const originalPrice = typeof manualOriginal === 'number'
    ? manualOriginal
    : course.price;
    const discountedPrice = typeof manualDiscounted === 'number'
    ? manualDiscounted
    : course.discountedPrice;
  
  const discount = originalPrice - discountedPrice;

  // Tax breakdown (GST included)
  const taxRate   = 0.18;
  const baseAmt   = discountedPrice / (1 + taxRate);
  let cgst = 0, sgst = 0, igst = 0;
  if (state.trim().toUpperCase() === 'UP') {
    cgst = baseAmt * 0.09;
    sgst = baseAmt * 0.09;
  } else {
    igst = baseAmt * 0.18;
  }
  const taxAmount   = cgst + sgst + igst;
  const totalAmount = discountedPrice;

  // Build and save invoice
  // const invoiceId = `${new Date().toISOString().slice(0,10)}-${uuidv4().slice(-6)}`;
  const today = new Date();
const dateStr = today.toISOString().slice(0, 10); // "YYYY-MM-DD"

const startOfDay = new Date(dateStr);
const endOfDay = new Date(dateStr);
endOfDay.setDate(endOfDay.getDate() + 1);

// count how many invoices already created today
const todaysCount = await Invoice.countDocuments({
  createdAt: { $gte: startOfDay, $lt: endOfDay }
});

// next serial, left–pad to 5 digits
const seq = (todaysCount + 1).toString().padStart(5, '0');

const invoiceId = `${dateStr}-${seq}`;


  const inv = new Invoice({
    invoiceId,
    ...(admissionFormId && mongoose.isValidObjectId(admissionFormId)
      ? { admissionFormId }
      : {}),
    studentName,
    fatherName,
    address1,
    address2,
    pincode: pincode, // optional
    phone,
    email,
    state,
    course: {
      id:               course._id,
      title:            course.title,
      originalPrice,
      discount,
      discountedPrice,
    },
    cgst,
    sgst,
    igst,
    taxAmount,
    totalAmount,
    transactionId,
    paymentMethod: 'Online',
  });

  await inv.save();
  return NextResponse.json({ invoice: inv });
}


export async function GET(req: NextRequest) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');

  const query: any = {};
  if (month) {
    const [y, m] = month.split('-').map(Number);
    query.createdAt = {
      $gte: new Date(y, m - 1, 1),
      $lt:  new Date(y, m, 1),
    };
  }

  const invoices = await Invoice.find(query).sort('-createdAt').lean();
  const gstTotal = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
  return NextResponse.json({ invoices, gstTotal });
}
