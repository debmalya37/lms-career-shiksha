// app/api/invoices/route.ts
// app/api/invoices/route.ts

import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Invoice from '@/models/invoiceModel';
import Course, { ICourse } from '@/models/courseModel';
import { IPreAdmission } from '@/models/preAdmissionModel';
import preAdmissionModel from '@/models/preAdmissionModel';

export async function POST(req: NextRequest) {
  await connectMongo();
  const body = await req.json();

  const {
    admissionFormId,
    studentName: manualName,
    fatherName:   manualFather,
    address1:     manualAddress1,
    address2:     manualAddress2,
    pincode:      manualPincode,
    phone:        manualPhone,
    email:        manualEmail,
    state:        manualState,
    transactionId: manualTxn,
    courseId:     manualCourseId,
    originalPrice:  manualOriginal,
    discountedPrice: manualDiscounted,
    paymentMethod:   manualPaymentMethod,
  } = body;

  // default or validate payment method
  const paymentMethod =
    typeof manualPaymentMethod === 'string' &&
    ['Online', 'Offline'].includes(manualPaymentMethod)
      ? manualPaymentMethod
      : 'Online';

  let studentName: string;
  let fatherName:  string;
  let address1:    string;
  let address2:    string | undefined;
  let pincode:     number | undefined;
  let phone:       string;
  let email:       string;
  let state:       string;
  let transactionId: string;
  let course:      ICourse;

  // 0️⃣ Idempotency: if this transactionId already exists, return it
  if (manualTxn) {
    const existing = await Invoice.findOne({
      transactionId: manualTxn,
      ...(admissionFormId && mongoose.isValidObjectId(admissionFormId)
        ? { admissionFormId }
        : {}),
    }).lean();
    if (existing) {
      return NextResponse.json({ invoice: existing }, { status: 203 });
    }
  }

  // 1️⃣ If an admissionFormId was provided, load from the form
  if (admissionFormId && mongoose.isValidObjectId(admissionFormId)) {
    const form = await preAdmissionModel
      .findById(admissionFormId)
      .lean<IPreAdmission>();
    if (!form) {
      return NextResponse.json(
        { error: 'Admission form not found' },
        { status: 404 }
      );
    }

    studentName   = form.name;
    fatherName    = form.fatherName;
    address1      = form.address1;
    address2      = form.address2;
    pincode       = form.pincode ? Number(form.pincode) : undefined;
    phone         = form.phone;
    email         = form.email;
    state         = form.state;
    transactionId = form.transactionId || manualTxn || '';

    course = (await Course.findById(form.courseId).lean()) as unknown as ICourse;
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
  } else {
    // 2️⃣ Manual entry: require just the basics (course + personal)
    if (
      !manualName ||
      !manualFather ||
      !manualAddress1 ||
      !manualPhone ||
      !manualEmail ||
      !manualState ||
      !manualCourseId ||
      !mongoose.isValidObjectId(manualCourseId)
    ) {
      return NextResponse.json(
        {
          error:
            'For manual invoices you must provide: studentName, fatherName, address1, phone, email, state, and a valid courseId',
        },
        { status: 400 }
      );
    }

    studentName   = manualName;
    fatherName    = manualFather;
    address1      = manualAddress1;
    address2      = manualAddress2;
    pincode       = manualPincode ? Number(manualPincode) : undefined;
    phone         = manualPhone;
    email         = manualEmail;
    state         = manualState;
    transactionId = manualTxn || '';

    course = (await Course.findById(manualCourseId).lean()) as unknown as  ICourse;
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
  }

  // 3️⃣ Pricing & discount
  const originalPrice = 
    typeof manualOriginal === 'number' ? manualOriginal : course.price;
  const discountedPrice =
    typeof manualDiscounted === 'number'
      ? Number((manualDiscounted).toFixed(2))
      : course.discountedPrice;
  const discount = originalPrice - discountedPrice;

  // 4️⃣ Tax breakdown
  const taxRate = 0.18;
  const baseAmt = discountedPrice / (1 + taxRate);
  let cgst = 0, sgst = 0, igst = 0;
  if (state.trim() === 'Uttar Pradesh' || state.trim() === 'UP') {
    cgst = baseAmt * 0.09;
    sgst = baseAmt * 0.09;
  } else {
    igst = baseAmt * 0.18;
  }
  const taxAmount = cgst + sgst + igst;
  const totalAmount = discountedPrice;

  // 5️⃣ Generate invoiceId (financial‐year based) …
    // 5️⃣ Generate invoiceId (financial‐year based) with On/Off prefix …
    const now = new Date();
    const year = now.getFullYear();
    const fyStart =
      now.getMonth() + 1 >= 4
        ? new Date(year, 3, 1)   // April 1st of current year
        : new Date(year - 1, 3, 1); // April 1st of last year
    const fyEnd = new Date(fyStart);
    fyEnd.setFullYear(fyStart.getFullYear() + 1);
  
    const prefix = paymentMethod === 'Offline' ? 'Off' : 'On';
  
    const prefixCount = await Invoice.countDocuments({
      createdAt: { $gte: fyStart, $lt: fyEnd },
      paymentMethod
    });
  
    const seq = String(prefixCount + 1).padStart(5, '0'); // 00001, 00002, ...
    const dateStr = now.toISOString().slice(0, 10);
    const invoiceId = `${prefix}-${dateStr}-${seq}`;
  

  // 6️⃣ Save
  const inv = new Invoice({
    invoiceId,
    ...(admissionFormId && mongoose.isValidObjectId(admissionFormId)
      ? { admissionFormId }
      : {}),
    studentName,
    fatherName,
    address1,
    address2,
    pincode,
    phone,
    email,
    state,
    course: {
      id: course._id,
      title: course.title,
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
    paymentMethod,
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
