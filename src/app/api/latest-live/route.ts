import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import LiveClass from '@/models/liveClassesModel';

export async function GET() {
  try {
    await connectMongo();

    // Fetch the latest live class
    const latestLiveClass = await LiveClass.findOne().sort({ createdAt: -1 });

    return NextResponse.json(latestLiveClass);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch the latest live class' }, { status: 500 });
  }
}
