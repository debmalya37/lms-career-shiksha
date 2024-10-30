// api/tutorials/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';

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

export async function GET() {
  try {
    await connectMongo();
    const tutorials = await Tutorial.find({})
      .populate('subject', 'name') // Populate subject
      .populate('topic', 'name'); // Populate topic

    return NextResponse.json(tutorials);
  } catch (error) {
    console.error("GET /api/tutorials Error:", error);
    return NextResponse.json({ error: 'Failed to fetch tutorials' }, { status: 500 });
  }
}
