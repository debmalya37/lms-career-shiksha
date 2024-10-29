import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';

export async function GET() {
  try {
    await connectMongo();

    // Fetch the latest course
    const latestCourse = await Course.findOne().sort({ createdAt: -1 }).populate('subject').populate('topic');
    return NextResponse.json(latestCourse);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch the latest course' }, { status: 500 });
  }
}
