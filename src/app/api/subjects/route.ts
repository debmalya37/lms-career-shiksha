import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Subject from '@/models/subjectModel';

export async function GET() {
  try {
    await connectMongo();
    const subjects = await Subject.find({});
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

// POST method to add a new subject
export async function POST(request: Request) {
  const { name, course } = await request.json(); // Get subject name and course ID from request

  if (!name || !course) {
    return NextResponse.json({ error: 'Subject name and course are required' }, { status: 400 });
  }

  try {
    await connectMongo();

    // Check if subject already exists
    const existingSubject = await Subject.findOne({ name, course });
    if (existingSubject) {
      return NextResponse.json({ error: 'Subject already exists' }, { status: 400 });
    }

    // Create and save new subject
    const newSubject = new Subject({ name, course }); // Include the course reference
    await newSubject.save();

    return NextResponse.json({ message: 'Subject added successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add subject' }, { status: 500 });
  }
}
