import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';

export async function POST(request: Request) {
  const { email, password, deviceIdentifier } = await request.json(); // Receive device identifier

  try {
    await connectMongo();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.deviceIdentifier && user.deviceIdentifier !== deviceIdentifier) {
      return NextResponse.json({ error: 'This account is already logged in on another device' }, { status: 403 });
    }

    // If no deviceIdentifier is set, set it for the first time
    if (!user.deviceIdentifier) {
      user.deviceIdentifier = deviceIdentifier;
    }

    const sessionToken = generateSessionToken();
    user.sessionToken = sessionToken;

    const expirationDate = new Date();
expirationDate.setDate(expirationDate.getDate() + (user?.subscription ?? 0));

    await user.save();

    const response = NextResponse.json({
      message: 'Login successful',
      sessionToken,
      user: {
        email: user.email,
        name: user.name,
        course: user.course,
        subscription: user?.subscription,
      },
    });
    response.cookies.set('sessionToken', sessionToken, {
      httpOnly: true,
      expires: expirationDate,
    });

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to log in' }, { status: 500 });
  }
}

function generateSessionToken() {
  return Math.random().toString(36).substr(2);
}
