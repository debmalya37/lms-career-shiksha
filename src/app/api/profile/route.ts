import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Profile from '@/models/profileModel';

export async function GET(request: Request) {
  // Simulating user ID (fetch from request/session in a real application)
  const userId = '12345';

  try {
    await connectMongo();

    // Find profile by user ID
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId, firstName, lastName, email, subject, aim } = await request.json();

  try {
    await connectMongo();

    // Find existing profile or create a new one
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { firstName, lastName, email, subject, aim },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: 'Profile saved successfully!', profile });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
