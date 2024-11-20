import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Topic from '@/models/topicModel';

export async function POST(request: Request) {
  const { id, name, subject } = await request.json(); // ID is required to update the topic

  if (!id || !name || !subject) {
    return NextResponse.json({ error: 'ID, name, and subject are required' }, { status: 400 });
  }

  try {
    await connectMongo();

    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      { name, subject },
      { new: true } // Return the updated document
    );

    if (!updatedTopic) {
      return NextResponse.json({ error: 'Topic not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Topic updated successfully!', topic: updatedTopic });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}
