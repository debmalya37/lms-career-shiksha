// api/profile
import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';
import Profile from '@/models/profileModel';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('sessionToken')?.value;
  console.log('Received session token:', sessionToken); // Debugging

  try {
    await connectMongo();
    
    // Find the user by session token
    const user = await User.findOne({ sessionToken }).populate('course');
    console.log('User fetched:', user); // Debugging

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = await Profile.findOne({ userId: user._id });
    console.log("Fetching profile data: ", profile); // Debugging
    return NextResponse.json({
      email: user.email,
      name: user.name,
      course: user.course,
      subscription: user.subscription,
      profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error); // Logging the error
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  const { userId, firstName, lastName, email, subject, aim } = await request.json();

  try {
    await connectMongo();

    // Find existing profile or create a new one
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { firstName, lastName, email, subject, aim },
      { new: true, upsert: true }
    );
      console.log("posting profile : ",profile);
    await User.findByIdAndUpdate(userId, { profile: profile._id });

    return NextResponse.json({ message: 'Profile saved successfully!', profile });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
