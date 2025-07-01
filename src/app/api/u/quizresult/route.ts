// app/api/quizresult/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import QuizResult from '@/models/quizResultModel';
import { User } from '@/models/user';


export async function GET(req: NextRequest) {
  await connectMongo();

  const sessionToken = req.cookies.get('sessionToken')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = await User.findOne({ sessionToken }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }


  const email = user.email || req.nextUrl.searchParams.get('email');
  if (!email || !user.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const results = await QuizResult.find({ userEmail: email }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(results);
}
