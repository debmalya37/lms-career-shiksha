// api/newSubject/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Subject from '@/models/subjectModel';

export async function POST(request: Request) {
  const { name } = await request.json(); // Get subject name only

  // Validate subject name
  if (!name) {
    return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
  }

  try {
    await connectMongo();

    // Check if subject with the same name already exists
    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return NextResponse.json({ error: 'Subject already exists' }, { status: 400 });
    }

    // Create and save new subject without course field
    const newSubject = new Subject({ name });
    await newSubject.save();

    return NextResponse.json({ message: 'Subject added successfully!', data: newSubject });
  } catch (error) {
    console.error('POST /api/newSubject Error:', error);
    return NextResponse.json({ error: 'Failed to add subject' }, { status: 500 });
  }
}
