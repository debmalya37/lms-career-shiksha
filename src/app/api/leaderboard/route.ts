// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import QuizLeaderboard from "@/models/quizLeaderboardModel";

export async function POST(req: NextRequest) {
  await dbConnect();
  const {
    quizId,
    quizTitle,
    courseId,
    courseTitle,
    userEmail,
    userName,
    score,
  } = await req.json();

  try {
    // Upsert: if this user already attempted, keep the highest score
    await QuizLeaderboard.findOneAndUpdate(
      { quizId, userEmail },
      {
        $max: { score },                 // only update if new `score` is higher
        quizTitle,
        courseId,
        courseTitle,
        userName,
        attemptedAt: new Date(),
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Leaderboard upsert error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
