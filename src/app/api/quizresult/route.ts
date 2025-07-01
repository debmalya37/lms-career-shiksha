// app/api/quizresult/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import QuizResult from '@/models/quizResultModel';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  await connectMongo();
  const {
    quizTitle,
    quizId,
    courseId,
    subjectId,
    score,
    correctAnswers,
    incorrectAnswers,
    userName,
    userEmail,
    answers,
  } = await request.json();

  // 1) Save to Mongo
  const doc = new QuizResult({
    quizTitle,
    quizId,
    courseId,
    subjectId,
    score,
    correctAnswers,
    incorrectAnswers,
    userName,
    userEmail,
    answers,
  });
  await doc.save();


  return NextResponse.json({ success: true, resultId: doc._id });
}


// ✅ GET – Fetch all quiz results (for admin)
export async function GET() {
  await connectMongo();
  try {
    const results = await QuizResult.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch quiz results:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz results' }, { status: 500 });
  }
}