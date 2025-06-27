// app/api/admission/route.ts
import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/lib/db';
import Admission from '../../../models/admissionModel';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { User } from '@/models/user';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result?.secure_url || '');
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export async function POST(req: NextRequest) {
  await connectMongo();
  // Get transactionId from search params
  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get("transactionId");

  if (!transactionId) {
    return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
  }

  const form = await req.formData();

  // required textual fields
  const courseId        = form.get('courseId')?.toString();
  const name            = form.get('name')?.toString();
  const fatherName      = form.get('fatherName')?.toString();
  const phone           = form.get('phone')?.toString();
  const email           = form.get('email')?.toString();
  const address1        = form.get('address1')?.toString();
  const address2        = form.get('address2')?.toString() || '';   
  const pincode         = form.get('pincode')?.toString() || '';   
  const state           = form.get('state')?.toString();
  const city            = form.get('city')?.toString();
  const dobStr          = form.get('dob')?.toString();


  if (
    !courseId || !name || !fatherName || !phone || !email ||
    !address1 || !state || !city || !dobStr || !pincode) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) {
    return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 });
  }

 

  // auth: find user
  const sessionToken = req.cookies.get('sessionToken')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const user = await User.findOne({ sessionToken }).lean();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  // save admission
  try {
    const admission = await Admission.create({
      userId:          user._id,
      courseId,
      name,
      fatherName,
      phone,
      email,
      address1,
      address2,
      pincode,
      state,
      city,
      dob,
      transactionId,
    });
    return NextResponse.json({ success: true, admissionId: admission._id });
  } catch (err: any) {
    console.error("DB save error:", err);
    return NextResponse.json({ error: 'Could not save admission' }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  await connectMongo();
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(admissions);
  } catch (err: any) {
    console.error("Failed to fetch admissions:", err);
    return NextResponse.json({ error: 'Could not fetch admissions' }, { status: 500 });
  }
}
