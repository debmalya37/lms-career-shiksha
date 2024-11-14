import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db'; // Import the default connection function
import LiveClass from '@/models/liveClassesModel'; // Import the LiveClass model

// POST method for adding a live class
export async function POST(request: Request) {
  const { title, url } = await request.json();

  try {
    await connectMongo(); // Establish database connection

    // Save the new live class with current timestamp
    const newLiveClass = new LiveClass({ title, url });
    await newLiveClass.save();

    return NextResponse.json({ message: 'Live class added successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add live class' }, { status: 500 });
  }
}

// GET method for fetching live classes from the last 24 hours
export async function GET() {
  try {
    await connectMongo(); // Establish database connection

    // Define the cutoff time for 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch the latest live class not older than 24 hours
    const liveClasses = await LiveClass.find({ createdAt: { $gte: twentyFourHoursAgo } })
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .limit(1)                 // Limit to the most recent one
      .lean();                  // Convert to plain JavaScript object for efficient use

    return NextResponse.json(liveClasses);
  } catch (error) {
    console.error("Error fetching live classes:", error);
    return NextResponse.json({ error: 'Failed to fetch live classes' }, { status: 500 });
  }
}
