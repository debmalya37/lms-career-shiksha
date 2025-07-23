// app/api/progress/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Progress from '@/models/progressModel';

export async function POST(request: Request) {
  await connectMongo();
  const { userId, courseId, tutorialId } = await request.json();

  // upsert a “completed” record
  const prog = await Progress.findOneAndUpdate(
    { user: userId, course: courseId, tutorial: tutorialId },
    { completed: true, completedAt: new Date() },
    { upsert: true, new: true },
  );

  return NextResponse.json({ message: 'Marked complete', progress: prog });
}
