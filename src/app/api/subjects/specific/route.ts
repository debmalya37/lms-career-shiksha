import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Subject from '@/models/subjectModel';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('course');
  const subjectId = searchParams.get('subject'); // New query param for specific subject

  try {
    await connectMongo();

    let query = {};
    if (courseId) query = { course: courseId };
    if (subjectId) query = { _id: subjectId }; // Override if subjectId is provided

    const subjects = await Subject.find(query).select('name course').lean();
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}
