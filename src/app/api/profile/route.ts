import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Profile from '@/models/profileModel';
import { User } from '@/models/user'; // Import User model

export async function GET(request: Request) {
  const userId = '12345'; // Simulating user ID; fetch from request/session in a real application

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

    // Update User model to link profile
    await User.findOneAndUpdate(
      { _id: userId },
      { profile: profile._id }, // Link profile to user
      { new: true }
    );

    return NextResponse.json({ message: 'Profile saved successfully!', profile });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
