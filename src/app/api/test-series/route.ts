// /api/test-series/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import TestSeries from '@/models/testSeriesModel';
import { User } from '@/models/user';
import Profile from '@/models/profileModel';

export async function POST(request: Request) {
  const { title, googleFormLink, course, subject } = await request.json();

  try {
    await connectMongo();
    const newTestSeries = new TestSeries({ 
      title, 
      googleFormLink, 
      course, 
      subject 
    });
    await newTestSeries.save();

    return NextResponse.json({ message: 'Test series added successfully!' });
  } catch (error) {
    console.error("POST /api/test-series Error:", error);
    return NextResponse.json({ error: 'Failed to add test series' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('sessionToken')?.value; // Get session token from cookies

  try {
    await connectMongo();

    // Find the user by session token
    const user = await User.findOne({ sessionToken }).populate('course');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = await Profile.findOne({ userId: user._id });
    const userCourse = user.course; // Assuming this is a single course; adjust if it's an array

    const query: any = {};
    if (userCourse) query.course = userCourse; // Filter by user's course

    const testSeries = await TestSeries.find(query)
      .populate('course', 'title') // Populate course title
      .populate('subject', 'name'); // Populate subject name

    return NextResponse.json(testSeries);
  } catch (error) {
    console.error("GET /api/test-series Error:", error);
    return NextResponse.json({ error: 'Failed to fetch test series' }, { status: 500 });
  }
}
