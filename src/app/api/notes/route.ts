import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Note from '@/models/noteModel';

export async function POST(request: Request) {
  const { title, url, subject } = await request.json();

  try {
    await connectMongo(); // connection to the DB

    const newNote = new Note({ title, url, subject });
    await newNote.save();

    return NextResponse.json({ message: 'Note added successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}

// GET method to fetch notes by subject
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject');

  try {
    await connectMongo(); // Connect to the DB

    const query = subject
      ? { subject: { $regex: new RegExp(subject, 'i') } } // Case-insensitive search
      : {};

    const notes = await Note.find(query); // Fetch all notes or by subject

    return NextResponse.json(notes); // Send the fetched data back to the client
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}
