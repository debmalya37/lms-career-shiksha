import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db'; // Import the default connection function
import LiveClass from '@/models/liveClassesModel'; // Import the LiveClass model

// POST method for adding a live class
export async function POST(request: Request) {
  const { title, url } = await request.json();

  try {
    await connectMongo(); // Establish database connection

    // Save the new live class
    const newLiveClass = new LiveClass({ title, url });
    await newLiveClass.save();

    return NextResponse.json({ message: 'Live class added successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add live class' }, { status: 500 });
  }
}

// GET method for fetching live classes
export async function GET() {
  try {
    await connectMongo(); // Establish database connection

    const liveClasses = await LiveClass.find({}); // Fetch all live classes
    console.log(liveClasses)
    return NextResponse.json(liveClasses); // Return the fetched data
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch live classes' }, { status: 500 });
  }
}
