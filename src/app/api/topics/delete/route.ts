import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Topic from '@/models/topicModel';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get('id'); // Get the topic ID from query params

  if (!topicId) {
    return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
  }

  try {
    await connectMongo();
    const deletedTopic = await Topic.findByIdAndDelete(topicId);

    if (!deletedTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Topic deleted successfully!' });
  } catch (error) {
    console.error('DELETE /api/topics/delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
