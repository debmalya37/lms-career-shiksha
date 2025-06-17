// app/api/invoices/route.ts

import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Invoice from '@/models/invoiceModel';
import AdmissionForm, { IAdmission } from '@/models/admissionModel';
import Course, { ICourse } from '@/models/courseModel';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  await connectMongo();
  const body = await req.json();
  
  const {
    
    admissionFormId,   // may be undefined
    studentName: manualName,
    fatherName: manualFather,
    studentAddress: manualAddress,
    state: manualState,
    transactionId: manualTxn,
    courseId: manualCourseId,
    originalPrice: manualOriginal,       // ← NEW
    discountedPrice: manualDiscounted,
    email: manualEmail,   // ← NEW
  } = body;
  console.log("Incoming body:", body);
  console.log("admissionFormId:", admissionFormId);
  let studentName: string,
      fatherName: string,
      studentAddress: string,
      state: string,
      email: string, // Default to empty if not provided
      transactionId: string,
      course: ICourse;

  // If admin passes a valid admissionFormId, pull defaults from that form:
  if (admissionFormId && mongoose.isValidObjectId(admissionFormId)) {
    const form = await AdmissionForm.findById(admissionFormId).lean<IAdmission>();
    if (!form) {
      return NextResponse.json({ error: 'Admission form not found' }, { status: 404 });
    }
    studentName    = form.name;
    fatherName     = form.fatherName;
    studentAddress = `${form.address1}${form.address2 ? ', ' + form.address2 : ''}, ${form.city}, ${form.state}`;
    state          = form.state;
    transactionId  = form.transactionId || manualTxn || '';
    email = form.email || manualEmail || '';


    // fetch course via form.courseId
    const c = await Course.findById(form.courseId).lean<ICourse>();
    if (!c) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    course = c;
  } else {
    // No formId → require all manual fields plus a valid courseId
    if (
      !manualName ||
      !manualFather ||
      !manualAddress ||
      !manualState ||
      !manualCourseId ||
      !mongoose.isValidObjectId(manualCourseId)
    ) {
      return NextResponse.json(
        { error: 'Provide either a valid admissionFormId or all student fields plus a valid courseId' },
        { status: 400 }
      );
    }
    studentName    = manualName;
    fatherName     = manualFather;
    studentAddress = manualAddress;
    state          = manualState;
    transactionId  = manualTxn || '';
    email          = manualEmail || '';
    const c = await Course.findById(manualCourseId).lean<ICourse>();
    if (!c) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    course = c;
  }

  // Pricing & discount
  // const originalPrice   = course.price;
  // const discountedPrice = course.discountedPrice;
  // const discount        = originalPrice - discountedPrice;

  const originalPrice = typeof manualOriginal === 'number'
    ? manualOriginal
    : course.price;

  const discountedPrice = typeof manualDiscounted === 'number'
    ? manualDiscounted
    : course.discountedPrice;

  const discount = originalPrice - discountedPrice;


  // GST is included in discountedPrice
const taxRate = 0.18;
const baseAmount = discountedPrice / (1 + taxRate);

let cgst = 0, sgst = 0, igst = 0;

if (state.trim().toUpperCase() === 'UP') {
  cgst = baseAmount * 0.09;
  sgst = baseAmount * 0.09;
} else {
  igst = baseAmount * 0.18;
}

const taxAmount = cgst + sgst + igst;
const totalAmount = discountedPrice; // No additional tax added


  // Build invoice document
   const invoiceId = `${new Date().toISOString().slice(0,10)}-${uuidv4().slice(-6)}`;
  const inv = new Invoice({
    invoiceId,
    ...(admissionFormId && mongoose.isValidObjectId(admissionFormId)
      ? { admissionFormId }
      : {}),
    studentName,
    fatherName,
    studentAddress,
    email,
    course: {
      id:               course._id,
      title:            course.title,
      originalPrice,   // ← now uses manual or default
      discount,
      discountedPrice, // ← now uses manual or default
    },
    state,
 
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
  const month = searchParams.get('month'); // e.g. '2025-06'

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
