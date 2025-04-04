// File: app/api/course/[courseId]/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import Course from "@/models/courseModel";
import Subject, { ISubject } from "@/models/subjectModel";
import { Types } from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    await connectMongo();

    const { courseId } = params;
    if (!Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    // Find the course by ID
    const course = await Course.findById(courseId).lean<{ _id: Types.ObjectId; subjects: Types.ObjectId[] }>();
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // If you need to fetch subject details too
    const subjectIds: Types.ObjectId[] = course.subjects as Types.ObjectId[];
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean<ISubject[]>();

    // Map subject IDs to subject docs
    const subjectMap: Record<string, ISubject> = subjects.reduce((acc, subject) => {
      acc[(subject._id as Types.ObjectId).toString()] = subject;
      return acc;
    }, {} as Record<string, ISubject>);

    // Overwrite course.subjects with actual subject docs
    const enrichedCourse = {
      ...course,
      subjects: subjectIds
        .map((sid) => subjectMap[sid.toString()] || null)
        .filter(Boolean),
    };

    return NextResponse.json({ course: enrichedCourse }, { status: 200 });
  } catch (error) {
    console.error("GET /api/course/[courseId] Error:", error);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}
