import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Topic from '@/models/topicModel';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subject');
  const topicId = searchParams.get('topic'); // New query param for specific topic

  try {
    await connectMongo();

    let query = {};
    if (subjectId) query = { subject: subjectId };
    if (topicId) query = { _id: topicId }; // Override if topicId is provided

    const topics = await Topic.find(query).select('name subject').lean();
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}
