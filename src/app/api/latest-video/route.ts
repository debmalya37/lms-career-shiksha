import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Video from '@/models/videoModel';

export async function GET() {
  try {
    await connectMongo();

    // Find the latest video by sorting by createdAt in descending order
    const latestVideo = await Video.findOne().sort({ createdAt: -1 }).populate('subject').populate('topic');

    if (!latestVideo) {
      return NextResponse.json({ message: 'No videos found' }, { status: 404 });
    }

    // Respond with the latest video info
    return NextResponse.json({
      title: latestVideo.title,
      subject: latestVideo.subject.name, // Ensure subject model has name field
      topic: latestVideo.topic.name, // Ensure topic model has name field
      createdAt: latestVideo.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch the latest video' }, { status: 500 });
  }
}
