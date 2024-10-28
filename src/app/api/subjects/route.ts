import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Subject from '@/models/subjectModel';

// GET method to fetch all subjects
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
  const { name } = await request.json(); // Parse request body to get the subject name

  if (!name) {
    return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
  }

  try {
    await connectMongo();

    // Check if subject already exists
    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return NextResponse.json({ error: 'Subject already exists' }, { status: 400 });
    }

    // Create and save new subject
    const newSubject = new Subject({ name });
    await newSubject.save();

    return NextResponse.json({ message: 'Subject added successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add subject' }, { status: 500 });
  }
}
