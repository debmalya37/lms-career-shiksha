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

    const courseId        = formData.get("id") as string;
    const title           = formData.get("title") as string;
    const description     = formData.get("description") as string;
    const price           = parseFloat(formData.get("price") as string) || 0;
    const isFree          = formData.get("isFree") === "true";
    const discountedPrice = parseFloat(formData.get("discountedPrice") as string) || 0;  // <-- new
    const subjectsRaw     = formData.get("subjects") as string;
    const subjects        = JSON.parse(subjectsRaw) as string[];
    const isHidden        = formData.get("isHidden") === "true";
    const courseImgFile   = formData.get("courseImg") as File | null;
    const introVideo = formData.get("introVideo") as string || "";
    const duration        = parseInt(formData.get("duration") as string, 10) || 0; 


    if (!courseId && (!title || !description || subjects.length === 0)) {
      console.error("Validation Error: Missing required fields.");
      return NextResponse.json(
        { error: "Course ID (if editing), title, description, and at least one subject are required." },
        { status: 400 }
      );
    }

    // Log the incoming data for debugging
    console.log("Incoming Data:", { courseId, title, description, subjects, isHidden, duration, price,
      isFree, courseImgFile });

    // Handle image upload
    let courseImgUrl = "";
    if (courseImgFile) {
      const buffer = await courseImgFile.arrayBuffer();
      courseImgUrl = await uploadToCloudinary(Buffer.from(buffer));
    }

    const uniqueSubjects = Array.from(new Set(subjects));

    const updatedFields: any = {
      title,
      description,
      isHidden,
      price,
      isFree,
      discountedPrice,
      duration,
      introVideo, // <-- NEW
      subjects: uniqueSubjects,
    };
    
    if (courseImgUrl) updatedFields.courseImg = courseImgUrl;

    if (courseId) {
      const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedFields, { new: true });
      if (!updatedCourse) {
        return NextResponse.json({ error: "Course not found or update failed." }, { status: 404 });
      }
      return NextResponse.json({ message: "Course updated successfully!", course: updatedCourse });
    } else {
      const newCourse = new Course({
        title,
        description,
        subjects: uniqueSubjects,
        isHidden,
        price,
        isFree,
        discountedPrice,
        duration,
        introVideo, // <-- NEW
        courseImg: courseImgUrl,
      });
      
      await newCourse.save();
      await Subject.updateMany(
        { _id: { $in: uniqueSubjects } },
        { $addToSet: { courses: newCourse._id } }
      );
      return NextResponse.json({ message: "Course added successfully!" });
    }
  } catch (error) {
    console.error("POST /api/course Error:", error);
    return NextResponse.json({ error: "Failed to add course" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectMongo();

    // Fetch courses without populating subjects
    const courses = await Course.find().lean();

    // Extract unique subject IDs from courses
    const subjectIds: Types.ObjectId[] = courses.flatMap(course => course.subjects as Types.ObjectId[]);

    // Fetch all subjects by IDs
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean<ISubject[]>();

    // Map subjects by their ID for quick lookup
    const subjectMap: Record<string, ISubject> = subjects.reduce((acc, subject) => {
      acc[(subject._id as Types.ObjectId).toString()] = subject;
      return acc;
    }, {} as Record<string, ISubject>);

    // Merge subjects with each course
    const enrichedCourses = courses.map(course => ({
      ...course,
      subjects: (course.subjects as Types.ObjectId[]).map(subjectId => subjectMap[subjectId.toString()] || null).filter(Boolean),
    }));

    return NextResponse.json(enrichedCourses);
  } catch (error) {
    console.error("GET /api/course Error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
