// api/course/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';

export async function GET() {
  try {
    await connectMongo();
    const courses = await Course.find({})
      .populate({
        path: 'subjects',
        model: 'Subject', // Only populate subjects in this query
      })
      .lean();

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/course Error:", error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { title, description, subjects } = await request.json();

  // Ensure required fields are present
  if (!title || !description || !subjects || !subjects.length) {
    return NextResponse.json({ error: 'Title, description, and at least one subject are required' }, { status: 400 });
  }

  try {
    await connectMongo();

    // Create and save new course
    const newCourse = new Course({
      title,
      description,
      subjects,
    });

    await newCourse.save();

    return NextResponse.json({ message: 'Course added successfully!' });
  } catch (error) {
    console.error("POST /api/course Error:", error);
    return NextResponse.json({ error: 'Failed to add course' }, { status: 500 });
  }
}
