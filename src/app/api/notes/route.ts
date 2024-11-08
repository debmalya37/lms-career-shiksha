// api/notes/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Note from '@/models/noteModel';
import Subject, { ISubject } from '@/models/subjectModel';
import Topic, { ITopic } from '@/models/topicModel';
import { Types } from 'mongoose';
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
    
    // Step 1: Build the query object based on the provided parameters
    const query: any = {};
    if (subjectId) query.subject = subjectId;
    if (topicId) query.topic = topicId;

    // Step 2: Fetch notes based on query (without populating)
    const notes = await Note.find(query).lean();

    // Step 3: Extract unique subject and topic IDs from notes
    const subjectIds = notes.map(note => note.subject as Types.ObjectId);
    const topicIds = notes.map(note => note.topic as Types.ObjectId);

    // Step 4: Fetch all subjects and topics by their IDs
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean<ISubject[]>();
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean<ITopic[]>();

    // Step 5: Map subjects and topics by their IDs for quick lookup
    const subjectMap = subjects.reduce((acc, subject) => {
      acc[(subject._id as Types.ObjectId).toString()] = subject;
      return acc;
    }, {} as Record<string, ISubject>);

    const topicMap = topics.reduce((acc, topic) => {
      acc[(topic._id as Types.ObjectId).toString()] = topic;
      return acc;
    }, {} as Record<string, ITopic>);

    // Step 6: Attach subject and topic data to each note
    const enrichedNotes = notes.map(note => ({
      ...note,
      subject: subjectMap[(note.subject as Types.ObjectId).toString()] || null,
      topic: topicMap[(note.topic as Types.ObjectId).toString()] || null,
    }));

    return NextResponse.json(enrichedNotes);
  } catch (error) {
    console.error("GET /api/notes Error:", error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}
