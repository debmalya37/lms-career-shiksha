// src/app/api/pre-admission/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import PreAdmission, { IPreAdmission } from '@/models/preAdmissionModel';

export async function GET() {
  try {
    await connectMongo();
    // fetch all, newest first
    const list = await PreAdmission.find()
      .sort({ createdAt: -1 })
      .lean<IPreAdmission>();
    return NextResponse.json(list);
  } catch (err: any) {
    console.error('GET /api/pre-admission error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch pre‑admissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      courseId,
      email,
      name,
      gender,
      phone,
      fatherName,
      address1,
      address2,
      pincode,
      state,
      city,
    } = body;

    console.log('POST /api/pre-admission body:', body);
    // simple validation
    if (
      !courseId ||
      !email ||
      !name ||
      !gender ||
      !phone ||
      !fatherName ||
      !address1 ||
      !pincode ||
      !state ||
      !city
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectMongo();
    const doc = await PreAdmission.create({
      courseId,
      email,
      name,
      gender,
      phone,
      fatherName,
      address1,
      address2: address2 || '', // optional, default to empty string
      pincode,
      state,
      city,
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/pre-admission error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create record' },
      { status: 500 }
    );
  }
}
