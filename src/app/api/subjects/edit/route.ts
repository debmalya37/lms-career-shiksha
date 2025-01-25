import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Subject from '@/models/subjectModel';
import Course from '@/models/courseModel';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image
async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'subjects' },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// POST method to edit an existing subject
export async function POST(request: Request) {
  const formData = await request.formData();
  const id = formData.get('id') as string; // Subject ID
  const name = formData.get('name') as string;
  const courses = formData.getAll('courses') as string[]; // Array of course IDs
  const isHidden = formData.get('isHidden') === 'true'; // Handle `isHidden` field as a boolean
  const subjectImgFile = formData.get('subjectImg') as File | null; // New image file (optional)

  if (!id || !name || courses.length === 0) {
    return NextResponse.json({ error: 'ID, name, and courses are required.' }, { status: 400 });
  }

  let subjectImgUrl = '';
  if (subjectImgFile) {
    try {
      const buffer = await subjectImgFile.arrayBuffer();
      subjectImgUrl = await uploadToCloudinary(Buffer.from(buffer));
    } catch (error) {
      console.error('Failed to upload subject image:', error);
      return NextResponse.json({ error: 'Failed to upload subject image.' }, { status: 500 });
    }
  }

  try {
    await connectMongo();

    // Find the subject to update
    const subject = await Subject.findById(id);
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found.' }, { status: 404 });
    }

    // Add `isHidden` field if it doesn't exist
    if (typeof subject.isHidden === 'undefined') {
      subject.isHidden = false;
    }

    // Update subject details
    subject.name = name;
    subject.courses = courses;
    subject.isHidden = isHidden;
    if (subjectImgUrl) {
      subject.subjectImg = subjectImgUrl; // Update image URL only if a new image is provided
    }

    await subject.save();

    // Update each course to include the updated subject in its `subjects` array
    await Course.updateMany(
      { _id: { $in: courses } },
      { $addToSet: { subjects: subject._id } } // Use `$addToSet` to avoid duplicates
    );

    return NextResponse.json({ message: 'Subject updated successfully!', subject });
  } catch (error) {
    console.error('POST /api/subjects/edit Error:', error);
    return NextResponse.json({ error: 'Failed to update subject.' }, { status: 500 });
  }
}
