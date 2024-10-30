// api/course/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';

export async function POST(request: Request) {
  try {
    const { title, description, subjects } = await request.json();
    if (!title || !description || !subjects) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectMongo();
    const newCourse = new Course({ title, description, subjects });
    await newCourse.save();

    return NextResponse.json({ message: 'Course added successfully!' });
  } catch (error) {
    console.error("POST /api/course Error:", error);
    return NextResponse.json({ error: 'Failed to add course' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectMongo();

    // Populate subjects within each course
    const courses = await Course.find({}).populate({
      path: 'subjects',
      model: 'Subject',
      populate: {
        path: 'topics',
        model: 'Topic',
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/course Error:", error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
