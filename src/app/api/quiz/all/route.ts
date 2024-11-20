import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Quiz from '@/models/quizModel';

export async function GET() {
    try {
      await connectMongo();
      const quizzes = await Quiz.find({}).lean();
      return NextResponse.json(quizzes);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch quizzzes' }, { status: 500 });
    }
  }