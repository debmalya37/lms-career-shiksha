// app/api/admission/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
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

// Helper to upload a buffer to Cloudinary
async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) return reject(err);
        resolve(result?.secure_url || '');
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// POST /api/admission
export async function POST(req: NextRequest) {
  await connectMongo();

  const form = await req.formData();

  // Required fields
  const courseId = form.get('courseId')?.toString();
  const name     = form.get('name')?.toString();
  const fatherName = form.get('fatherName')?.toString();
  const phone    = form.get('phone')?.toString();
  const email    = form.get('email')?.toString();
  const address1 = form.get('address1')?.toString();
  const address2 = form.get('address2')?.toString() || '';
  const state    = form.get('state')?.toString();
  const dobStr   = form.get('dob')?.toString();
  const aadhaarNumber = form.get('aadhaarNumber')?.toString();

  const profileFile = form.get('profileImage') as File | null;
  const aadhaarFile = form.get('aadhaarImage') as File | null;

  if (!courseId || !name || !fatherName || !phone || !email ||
      !address1 || !state || !dobStr || !aadhaarNumber ||
      !profileFile || !aadhaarFile) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Parse date
  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) {
    return NextResponse.json({ error: 'Invalid DOB' }, { status: 400 });
  }

  // Read the File blobs into buffers
  const profileBuffer = Buffer.from(await profileFile.arrayBuffer());
  const aadhaarBuffer = Buffer.from(await aadhaarFile.arrayBuffer());

  let profileImageUrl: string, aadhaarImageUrl: string;
  try {
    profileImageUrl  = await uploadToCloudinary(profileBuffer, 'admission/profile');
    aadhaarImageUrl  = await uploadToCloudinary(aadhaarBuffer, 'admission/aadhaar');
  } catch (err: any) {
    console.error('Cloudinary upload error', err);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }

  // Identify the user by sessionToken cookie
  const sessionToken = req.cookies.get('sessionToken')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const user = await User.findOne({ sessionToken }).lean();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  // Create the Admission record
  try {
    const admission = await Admission.create({
      userId:           user._id,
      courseId,
      name,
      fatherName,
      phone,
      email,
      address1,
      address2,
      state,
      dob,
      profileImageUrl,
      aadhaarImageUrl,
      aadhaarNumber,
    });
    return NextResponse.json({ success: true, admissionId: admission._id });
  } catch (err: any) {
    console.error('DB save error', err);
    return NextResponse.json({ error: 'Could not save admission' }, { status: 500 });
  }
}


export async function GET(_req: NextRequest) {
  await connectMongo();
  try {
    const admissions = await Admission.find()
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(admissions);
  } catch (err: any) {
    console.error('Failed to fetch admissions:', err);
    return NextResponse.json(
      { error: 'Could not fetch admissions' },
      { status: 500 }
    );
  }
}