import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Note from '@/models/noteModel';

export async function POST(request: Request) {
  try {
    await connectMongo();
    const { id, title, url, subject, topic } = await request.json(); // Pass note ID and other fields for update

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    // Update the note
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { title, url, subject, topic },
      { new: true } // Return the updated document
    );

    if (!updatedNote) {
      return NextResponse.json({ error: 'Note not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note updated successfully!', note: updatedNote });
  } catch (error) {
    console.error("POST /api/notes/edit Error:", error);
    return NextResponse.json({ error: 'Failed to edit note' }, { status: 500 });
  }
}
