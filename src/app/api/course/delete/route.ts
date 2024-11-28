import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('id'); // Get the course ID from query params

  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
  }

  try {
    await connectMongo();
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Course deleted successfully!' });
  } catch (error) {
    console.error('DELETE /api/course/delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
