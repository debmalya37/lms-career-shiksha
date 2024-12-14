import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subjectId'); // Query param for subjectId

  try {
    await connectMongo();

    if (subjectId) {
      // Find all courses containing the specific subject
      const courses = await Course.find({ subjects: subjectId }).select('title _id').lean();
      if (!courses.length) {
        return NextResponse.json({ error: 'No courses found for the given subject' }, { status: 404 });
      }
      return NextResponse.json(courses);
    }

    // Default behavior: return all courses
    const courses = await Course.find().select('title _id').lean();
    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/course/specific Error:", error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
