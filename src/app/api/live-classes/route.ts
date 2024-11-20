import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db'; // Import the default connection function
import LiveClass from '@/models/liveClassesModel'; // Import the LiveClass model

// POST method for adding a live class under a specific course
export async function POST(request: Request) {
  const { title, url, course } = await request.json();

  try {
    await connectMongo(); // Connect to MongoDB

    // Save the new live class with the course reference
    const newLiveClass = new LiveClass({ title, url, course });
    await newLiveClass.save();

    return NextResponse.json({ message: 'Live class added successfully!' });
  } catch (error) {
    console.error('Error adding live class:', error);
    return NextResponse.json({ error: 'Failed to add live class' }, { status: 500 });
  }
}


// GET method for fetching live classes from the last 24 hours
// GET method for fetching live classes with course information
export async function GET() {
  try {
    await connectMongo(); // Connect to MongoDB

    // Define the cutoff time for 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch live classes with course information
    const liveClasses = await LiveClass.find({ createdAt: { $gte: twentyFourHoursAgo } })
      .sort({ createdAt: -1 })
      .populate('course', 'title') // Populate course title
      .lean();

    return NextResponse.json(liveClasses);
  } catch (error) {
    console.error('Error fetching live classes:', error);
    return NextResponse.json({ error: 'Failed to fetch live classes' }, { status: 500 });
  }
}
