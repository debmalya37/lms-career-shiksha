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
  const form = await req.formData();

  // required textual fields
  const courseId        = form.get('courseId')?.toString();
  const name            = form.get('name')?.toString();
  const fatherName      = form.get('fatherName')?.toString();
  const phone           = form.get('phone')?.toString();
  const email           = form.get('email')?.toString();
  const address1        = form.get('address1')?.toString();
  const address2        = form.get('address2')?.toString() || '';
  const state           = form.get('state')?.toString();
  const city            = form.get('city')?.toString();
  const dobStr          = form.get('dob')?.toString();

  // required files
  const photoFile       = form.get('photoOfCandidate') as File | null;
  const aadhaarFront    = form.get('aadhaarFront')       as File | null;
  const aadhaarBack     = form.get('aadhaarBack')        as File | null;

  if (
    !courseId || !name || !fatherName || !phone || !email ||
    !address1 || !state || !city || !dobStr ||
    !photoFile || !aadhaarFront || !aadhaarBack
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) {
    return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 });
  }

  // turn each file into a Buffer
  const photoBuf    = Buffer.from(await photoFile.arrayBuffer());
  const frontBuf    = Buffer.from(await aadhaarFront.arrayBuffer());
  const backBuf     = Buffer.from(await aadhaarBack.arrayBuffer());

  let profileImageUrl: string, aadhaarFrontUrl: string, aadhaarBackUrl: string;
  try {
    profileImageUrl  = await uploadToCloudinary(photoBuf,   'admission/profile');
    aadhaarFrontUrl  = await uploadToCloudinary(frontBuf,   'admission/aadhaar/front');
    aadhaarBackUrl   = await uploadToCloudinary(backBuf,    'admission/aadhaar/back');
  } catch (err: any) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
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
      state,
      city,
      dob,
      profileImageUrl,
      aadhaarFrontUrl,
      aadhaarBackUrl,
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
