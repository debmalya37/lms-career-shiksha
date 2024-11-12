// api/topics/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Topic from '@/models/topicModel';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subject');

  try {
    await connectMongo();
    const topics = await Topic.find({ subject: subjectId }).select('name').lean();
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { name, subject } = await request.json();

  if (!name || !subject) {
    return NextResponse.json({ error: 'Both topic name and subject are required' }, { status: 400 });
  }

  try {
    await connectMongo();
    const newTopic = new Topic({ name, subject });
    await newTopic.save();

    return NextResponse.json({ message: 'Topic added successfully!', data: newTopic });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add topic' }, { status: 500 });
  }
}
