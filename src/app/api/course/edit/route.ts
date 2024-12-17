import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import Course from "@/models/courseModel";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

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
      { folder: "courses" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || "");
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

    // Validate incoming data
    const courseId = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const subjects = JSON.parse(formData.get("subjects") as string || "[]");
    const courseImgFile = formData.get("courseImg") as File | null;
    const isHidden = formData.get("isHidden") === "true";

    if (!courseId || !title || !description) {
      console.error("Validation Error: Missing required fields.");
      return NextResponse.json(
        { error: "Course ID, title, and description are required." },
        { status: 400 }
      );
    }

    // Log the incoming data for debugging
    console.log("Incoming Data:", { courseId, title, description, subjects, isHidden });

    // Handle image upload
    let courseImgUrl = "";
    if (courseImgFile) {
      const buffer = await courseImgFile.arrayBuffer();
      courseImgUrl = await uploadToCloudinary(Buffer.from(buffer));
    }

    // Ensure subjects are unique
    const uniqueSubjects = Array.from(new Set(subjects));

    // Prepare fields for update
    const updatedFields: any = {
      title,
      description,
      isHidden,
      subjects: uniqueSubjects, // Overwrite subjects array with unique values
    };
    if (courseImgUrl) updatedFields.courseImg = courseImgUrl;

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updatedFields,
      { new: true }
    );

    if (!updatedCourse) {
      console.error("Update Error: Course not found.");
      return NextResponse.json({ error: "Course not found or update failed." }, { status: 404 });
    }

    return NextResponse.json({ message: "Course updated successfully!", course: updatedCourse });
  } catch (error) {
    console.error("POST /api/course/edit Error:", error);
    return NextResponse.json({ error: "Failed to edit course." }, { status: 500 });
  }
}