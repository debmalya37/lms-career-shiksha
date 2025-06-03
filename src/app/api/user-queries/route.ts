// app/api/user-queries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserQueryModel from '../../../models/userQueryModel';

export async function POST(req: NextRequest) {
  let body: {
    fullName?: string;
    phoneNumber?: string;
    interestCourse?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { fullName, phoneNumber, interestCourse, message } = body;
  if (!fullName || !phoneNumber || !interestCourse || !message) {
    return NextResponse.json(
      { error: 'All fields (fullName, phoneNumber, interestCourse, message) are required' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const newQuery = await UserQueryModel.create({ fullName, phoneNumber, interestCourse, message });
    return NextResponse.json({ success: true, query: newQuery });
  } catch (err) {
    console.error('Failed to save user query:', err);
    return NextResponse.json({ error: 'Failed to save query' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const queries = await UserQueryModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ queries });
  } catch (err) {
    console.error('Failed to fetch user queries:', err);
    return NextResponse.json({ error: 'Failed to fetch queries' }, { status: 500 });
  }
}
