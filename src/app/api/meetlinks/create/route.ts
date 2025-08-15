import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MeetLink from '@/models/meetLink';

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  const { title, link, courseIds } = body;

  if (!title || !link || !Array.isArray(courseIds)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const saved = await MeetLink.create({ title, link, courseIds });
    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
