import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Subject from '@/models/subjectModel';

export async function POST(request: Request) {
  const { id, name, course } = await request.json(); // ID is required to update the subject

  if (!id || !name || !course) {
    return NextResponse.json({ error: 'ID, name, and course are required' }, { status: 400 });
  }

  try {
    await connectMongo();

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { name, course },
      { new: true } // Return the updated document
    );

    if (!updatedSubject) {
      return NextResponse.json({ error: 'Subject not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subject updated successfully!', subject: updatedSubject });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}
