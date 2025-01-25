import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Subject from '@/models/subjectModel';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import Course from '@/models/courseModel';

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

// POST method to add a new subject with an image
export async function POST(request: Request) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const courses = formData.getAll('courses') as string[]; // Array of course IDs
  const isHidden = formData.get('isHidden') === 'true'; // Handle `isHidden` field as a boolean
  const subjectImgFile = formData.get('subjectImg') as File | null;

  if (!name || courses.length === 0) {
    return NextResponse.json({ error: 'Name and courses are required.' }, { status: 400 });
  }

  let subjectImgUrl = '';
  if (subjectImgFile) {
    try {
      const buffer = await subjectImgFile.arrayBuffer();
      subjectImgUrl = await uploadToCloudinary(Buffer.from(buffer));
    } catch (error) {
      return NextResponse.json({ error: 'Failed to upload subject image.' }, { status: 500 });
    }
  }

  try {
    await connectMongo();

    // Create the new subject
    const newSubject = new Subject({ name, courses, subjectImg: subjectImgUrl, isHidden });
    await newSubject.save();

    // Update each course to include the new subject in its `subjects` array
    await Course.updateMany(
      { _id: { $in: courses } },
      { $addToSet: { subjects: newSubject._id } } // Use `$addToSet` to avoid duplicates
    );

    return NextResponse.json({ message: 'Subject added successfully!', subject: newSubject });
  } catch (error) {
    console.error("POST /api/subjects Error:", error);
    return NextResponse.json({ error: 'Failed to add subject.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectMongo();
    const subjects = await Subject.find({}).lean();

    // Add `isHidden` field to preexisting subjects if it doesn't exist
    const updatedSubjects = await Promise.all(
      subjects.map(async (subject) => {
        if (typeof subject.isHidden === 'undefined') {
          subject.isHidden = false;
          await Subject.updateOne({ _id: subject._id }, { isHidden: false });
        }
        return subject;
      })
    );

    return NextResponse.json(updatedSubjects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}
