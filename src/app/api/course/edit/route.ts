import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary upload function using stream
async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'courses' },
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

export async function POST(request: Request) {
  try {
    await connectMongo();
    const formData = await request.formData();
    const courseId = formData.get('id') as string; // Pass course ID for identification
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const subjects = formData.getAll('subjects') as string[];
    const courseImgFile = formData.get('courseImg') as File | null;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    let courseImgUrl = '';
    if (courseImgFile) {
      const buffer = await courseImgFile.arrayBuffer();
      const bufferData = Buffer.from(buffer);
      courseImgUrl = await uploadToCloudinary(bufferData);
    }

    // Update the course
    const updatedFields: any = {
      title,
      description,
      subjects,
    };
    if (courseImgUrl) updatedFields.courseImg = courseImgUrl;

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedFields, { new: true });

    if (!updatedCourse) {
      return NextResponse.json({ error: 'Course not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Course updated successfully!', course: updatedCourse });
  } catch (error) {
    console.error("POST /api/course/edit Error:", error);
    return NextResponse.json({ error: 'Failed to edit course' }, { status: 500 });
  }
}
