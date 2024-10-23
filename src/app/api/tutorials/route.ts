import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';

// POST method for adding a tutorial video
export async function POST(request: Request) {
  const { title, url } = await request.json();

  try {
    await connectMongo(); // Establish connection to the DB

    const newTutorial = new Tutorial({ title, url });
    await newTutorial.save();

    return NextResponse.json({ message: 'Tutorial video added successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add tutorial' }, { status: 500 });
  }
}

// GET method for fetching tutorial videos
export async function GET() {
  try {
    await connectMongo(); // Connect to the DB

    const tutorials = await Tutorial.find({}); // Fetch all tutorial videos
    console.log(tutorials);
    return NextResponse.json(tutorials); // Send the fetched data back to the client
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tutorials' }, { status: 500 });
  }
}
