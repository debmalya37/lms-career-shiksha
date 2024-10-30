// api/notes/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Note from '@/models/noteModel';

export async function POST(request: Request) {
  const { title, url, subject, topic } = await request.json();

  try {
    await connectMongo();
    const newNote = new Note({ title, url, subject, topic });
    await newNote.save();
    return NextResponse.json({ message: 'Note added successfully!' });
  } catch (error) {
    console.error("POST /api/notes Error:", error);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subject');
  const topicId = searchParams.get('topic');

  try {
    await connectMongo();
    const query: any = {};
    if (subjectId) query.subject = subjectId;
    if (topicId) query.topic = topicId;

    const notes = await Note.find(query).populate('subject', 'name').populate('topic', 'name');
    return NextResponse.json(notes);
  } catch (error) {
    console.error("GET /api/notes Error:", error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}
