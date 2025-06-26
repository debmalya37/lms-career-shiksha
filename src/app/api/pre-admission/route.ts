// src/app/api/pre-admission/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import PreAdmission, { IPreAdmission } from '@/models/preAdmissionModel';
import { User } from '@/models/user';

export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    // Build a filter object
    const filter: Partial<Pick<IPreAdmission, 'email'>> = {};

    const url = new URL(req.url);
    const emailParam = url.searchParams.get('email');
    const mine       = url.searchParams.get('mine');

    if (emailParam) {
      // 1) explicit email filter
      filter.email = emailParam;
    } else if (mine === 'true') {
      // 2) restrict to the currently logged-in user
      const sessionToken = req.cookies.get('sessionToken')?.value;
      if (!sessionToken) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      const user = await User.findOne({ sessionToken }).lean();
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      filter.email = user.email;
    }
    // else: no filter → fetch all

    // fetch filtered list, newest first
    const list = await PreAdmission.find(filter)
      .sort({ createdAt: -1 })
      .lean<IPreAdmission>();

    return NextResponse.json(list);
  } catch (err: any) {
    console.error('GET /api/pre-admission error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch pre-admissions' },
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
      dob,
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
      !city  ||
      !dob
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
      dob: new Date(dob), // ensure dob is a Date object
      transactionId: '', // initially empty, can be updated later
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
