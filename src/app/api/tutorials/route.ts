// api/tutorials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';
import { isValidObjectId } from 'mongoose';

export async function POST(request: Request) {
  const { title, url, description, subject, topic } = await request.json();

  try {
    await connectMongo();
    const newTutorial = new Tutorial({ title, url, description, subject, topic });
    await newTutorial.save();

    return NextResponse.json({ message: 'Tutorial video added successfully!' });
  } catch (error) {
    console.error("POST /api/tutorials Error:", error);
    return NextResponse.json({ error: 'Failed to add tutorial' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subjectIds = searchParams.get('subjectIds');

  try {
    await connectMongo();

    // Check if no searchParams are provided
    if (!subjectIds) {
      const tutorials = await Tutorial.find({}).lean(); // Fetch all tutorials
      return NextResponse.json(tutorials);
    }

    // If subjectIds are provided, validate and fetch filtered results
    const idsArray = subjectIds.split(',').filter(isValidObjectId); // Validate ObjectIds
    if (idsArray.length === 0) {
      return NextResponse.json({ error: 'Invalid subject IDs provided.' }, { status: 400 });
    }

    const tutorials = await Tutorial.find({ subject: { $in: idsArray } })
      .populate('subject', 'name') // Populate subject name
      .populate('topic', 'name'); // Populate topic name

    if (!tutorials.length) {
      return NextResponse.json({ message: 'No tutorials found.' }, { status: 200 });
    }

    return NextResponse.json(tutorials);
  } catch (error) {
    console.error("GET /api/tutorials Error:", error);
    return NextResponse.json({ error: 'Failed to fetch tutorials' }, { status: 500 });
  }
}
