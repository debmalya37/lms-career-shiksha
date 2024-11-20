import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';
import Subject, { ISubject } from '@/models/subjectModel';
import { Types } from 'mongoose';
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
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const subjects = formData.getAll('subjects') as string[];
    const isHidden = formData.get('isHidden') === 'true'; // Extract isHidden value
    const courseImgFile = formData.get('courseImg') as File | null;

    if (!title || !description || subjects.length === 0) {
      return NextResponse.json({ error: 'Title, description, and at least one subject are required' }, { status: 400 });
    }

    let courseImgUrl = '';
    if (courseImgFile) {
      const buffer = await courseImgFile.arrayBuffer();
      const bufferData = Buffer.from(buffer);
      courseImgUrl = await uploadToCloudinary(bufferData);
    }

    const newCourse = new Course({
      title,
      description,
      subjects,
      isHidden, // Save the isHidden value
      courseImg: courseImgUrl,
    });

    await newCourse.save();
    return NextResponse.json({ message: 'Course added successfully!' });
  } catch (error) {
    console.error("POST /api/course Error:", error);
    return NextResponse.json({ error: 'Failed to add course' }, { status: 500 });
  }
}







  export async function GET(request: Request) {
  try {
    await connectMongo();

    const showHidden = request.url.includes('admin'); // Check if the request is from the admin
    const query = showHidden ? {} : { isHidden: false }; // Include hidden courses for admin, exclude otherwise

    const courses = await Course.find(query).lean();

    const subjectIds: Types.ObjectId[] = courses.flatMap(course => course.subjects as Types.ObjectId[]);
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean<ISubject[]>();

    const subjectMap: Record<string, ISubject> = subjects.reduce((acc, subject) => {
      acc[(subject._id as Types.ObjectId).toString()] = subject; // Convert _id to string to avoid type issues
      return acc;
    }, {} as Record<string, ISubject>);

    const enrichedCourses = courses.map(course => ({
      ...course,
      subjects: (course.subjects as Types.ObjectId[]).map(subjectId => subjectMap[subjectId.toString()] || null).filter(Boolean),
    }));

    return NextResponse.json(enrichedCourses);
  } catch (error) {
    console.error("GET /api/course Error:", error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

  
