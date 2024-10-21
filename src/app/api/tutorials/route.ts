import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';

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
