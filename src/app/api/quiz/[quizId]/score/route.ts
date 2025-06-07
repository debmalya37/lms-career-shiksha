// app/api/quiz/[quizId]/score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Quiz from '@/models/quizModel';
import QuizScore from '@/models/quizScoreModel';
import { User } from '@/models/user';
import mongoose from 'mongoose';

export async function POST(req: NextRequest, { params }: { params: { quizId: string } }) {
  await connectMongo();
  const quizId = params.quizId;
  const { score, total } = await req.json();
  const sessionToken = req.cookies.get('sessionToken')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const user = await User.findOne({ sessionToken });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

  // ensure quiz exists
  const quiz = await Quiz.findById(quizId);
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

  // upsert: only keep the highest score
  const existing = await QuizScore.findOne({ userId: user._id, quizId });
  if (existing) {
    if (score <= existing.score) {
      return NextResponse.json({ message: 'Score not improved' }, { status: 200 });
    }
    existing.score = score;
    existing.total = total;
    existing.takenAt = new Date();
    await existing.save();
  } else {
    await QuizScore.create({
      userId: user._id,
      quizId,
      score,
      total,
    });
  }

  return NextResponse.json({ success: true });
}


export async function GET(req: NextRequest, { params }: { params: { quizId: string } }) {
  await connectMongo();
  const quizId = params.quizId;

  // Top 20 scores, sorted descending, include user name
  const topScores = await QuizScore.aggregate([
    { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
    { $sort: { score: -1, takenAt: 1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { 
      $project: {
        _id: 0,
        userId:  '$user._id',
        name:    '$user.name',
        score:   1,
        total:   1,
        takenAt: 1
      }
    }
  ]);

  return NextResponse.json(topScores);
}
