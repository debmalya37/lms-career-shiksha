import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Course from '@/models/courseModel';

export async function POST(request: Request) {
  const { title, description, url, subject, topic } = await request.json();

  try {
    await connectMongo();

    const newCourse = new Course({ title, description, url, subject, topic });
    await newCourse.save();

    return NextResponse.json({ message: 'Course added successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add course' }, { status: 500 });
  }
}

// GET method to fetch all courses or filter by subject/topic
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject');
  const topic = searchParams.get('topic');

  try {
    await connectMongo();

    const query: any = {};
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;

    const courses = await Course.find(query).populate('subject').populate('topic');

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
