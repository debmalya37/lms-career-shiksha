import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subjectId'); // Query param for subjectId

  try {
    await connectMongo();

    if (subjectId) {
      // Find the course containing the specific subject
      const course = await Course.findOne({ subjects: subjectId }).select('title _id').lean();
      if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      return NextResponse.json(course);
    }

    // Default behavior: return all courses
    const courses = await Course.find().select('title').lean();
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
