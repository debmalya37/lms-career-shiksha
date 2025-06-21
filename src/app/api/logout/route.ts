// app/api/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import { User } from '@/models/user';

export async function POST(req: NextRequest) {
  // grab the cookie
  const sessionToken = req.cookies.get('sessionToken')?.value;
  if (sessionToken) {
    await connectMongo();
    // remove sessionToken from user record
    await User.updateOne({ sessionToken }, { $unset: { sessionToken: "" } });
  }

  // clear the cookie in the browser
  const res = NextResponse.json({ message: 'Logged out' });
  res.cookies.set({
    name:    'sessionToken',
    value:   '',
    path:    '/',
    maxAge:  0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
