import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import TestSeries from '@/models/testSeriesModel'; // Ensure you have this model

// POST method for adding a test series question
export async function POST(request: Request) {
  const { question, correctAnswer, options, subject } = await request.json();

  try {
    await connectMongo(); // Establish connection to the DB

    const newTestSeries = new TestSeries({ question, correctAnswer, options, subject });
    await newTestSeries.save();

    return NextResponse.json({ message: 'Test series question added successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add test series question' }, { status: 500 });
  }
}

// GET method for fetching test series questions
export async function GET() {
  try {
    await connectMongo(); // Connect to the DB

    const testSeries = await TestSeries.find({}); // Fetch all test series questions
    console.log(testSeries);
    return NextResponse.json(testSeries); // Send the fetched data back to the client
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test series' }, { status: 500 });
  }
}
