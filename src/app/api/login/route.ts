import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    await connectMongo();

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Compare the password directly without hashing
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate a session token (replace with secure token generation for production)
    const sessionToken = generateSessionToken();
    user.sessionToken = sessionToken;

    // Set session expiration based on subscription duration
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + user.subscription);

    await user.save();

    // Set cookie with expiration date
    const response = NextResponse.json({
      message: 'Login successful',
      sessionToken,
      user: {
        email: user.email,
        name: user.name,
        course: user.course,
        subscription: user.subscription,
      },
    });
    response.cookies.set('sessionToken', sessionToken, {
      httpOnly: true,
      expires: expirationDate,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log in' }, { status: 500 });
  }
}

// Simple session token generation
function generateSessionToken() {
  return Math.random().toString(36).substr(2);
}
