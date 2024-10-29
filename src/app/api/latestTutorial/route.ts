import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';

export async function GET() {
  try {
    await connectMongo();

    // Fetch the latest tutorial
    const latestTutorial = await Tutorial.findOne().sort({ createdAt: -1 });

    return NextResponse.json(latestTutorial);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch the latest tutorial' }, { status: 500 });
  }
}
