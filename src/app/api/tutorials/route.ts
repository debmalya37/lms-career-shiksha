import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';

// POST method for adding a tutorial video
export async function POST(request: Request) {
  const { title, url, description, course, subject, topic } = await request.json();

  try {
    await connectMongo();

    // Create and save new tutorial
    const newTutorial = new Tutorial({ title, url, description, course, subject, topic });
    await newTutorial.save();

    return NextResponse.json({ message: 'Tutorial video added successfully!' });
  } catch (error) {
    console.error("POST /api/tutorials Error:", error);
    return NextResponse.json({ error: 'Failed to add tutorial' }, { status: 500 });
  }
}

// GET method for fetching tutorial videos with populated fields
export async function GET() {
  try {
    await connectMongo();

    const tutorials = await Tutorial.find({})
      .populate({
        path: 'course',
        populate: {
          path: 'subject', // Populates the subjects under each course
          populate: { path: 'topic' } // Populates the topics under each subject
        }
      })
      .populate('subject')
      .populate('topic');

    return NextResponse.json(tutorials);
  } catch (error) {
    console.error("GET /api/tutorials Error:", error);
    return NextResponse.json({ error: 'Failed to fetch tutorials' }, { status: 500 });
  }
}
