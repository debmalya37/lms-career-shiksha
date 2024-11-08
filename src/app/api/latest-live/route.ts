import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import LiveClass from '@/models/liveClassesModel';

export async function GET() {
  try {
    await connectMongo();

    
    // Calculate the date and time of 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Fetch the latest live class created within the last 24 hours
    const latestLiveClass = await LiveClass.findOne({
      createdAt: { $gte: oneDayAgo } // Only find if created within the last 24 hours
    }).sort({ createdAt: -1 });

    // Return the latest live class if it exists, otherwise indicate none is available
    if (latestLiveClass) {
      return NextResponse.json(latestLiveClass);
    } else {
      return NextResponse.json({ message: 'No recent live class available' }, { status: 404 });
    }
  } catch (error) {
    console.error("GET /api/latest-live Error:", error);
    return NextResponse.json({ error: 'Failed to fetch the latest live class' }, { status: 500 });
  }
}
