import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Topic from '@/models/topicModel';
import Subject from '@/models/subjectModel';

// GET topics based on subject ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subject');

  try {
    await connectMongo();
    const topics = await Topic.find({ subject: subjectId });
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

// POST method to add a new topic to a specific subject
export async function POST(request: Request) {
  const { name, subjectId } = await request.json();

  if (!name || !subjectId) {
    return NextResponse.json({ error: 'Both topic name and subject ID are required' }, { status: 400 });
  }

  try {
    await connectMongo();

    // Check if the subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Create a new topic and link it to the subject
    const newTopic = new Topic({ name, subject: subjectId });
    await newTopic.save();

    return NextResponse.json({ message: 'Topic added successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add topic' }, { status: 500 });
  }
}
