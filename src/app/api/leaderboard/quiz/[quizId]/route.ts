// File: app/api/leaderboard/quiz/[quizId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import QuizLeaderboard from "@/models/quizLeaderboardModel";

export async function GET(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  await dbConnect();
  const { quizId } = params;

  // Fetch all entries for that quiz
  const entries = await QuizLeaderboard.find({ quizId })
    .sort({ score: -1, attemptedAt: 1 })
    .lean();

  if (!entries.length) {
    return NextResponse.json({
      quizTitle:    "Unknown Quiz",
      courseTitle:  "",
      topScore:     0,
      averageScore: 0,
      entries:      [],
    });
  }

  // Derive global values once
  const topScore = entries[0].score;
  const averageScore =
    entries.reduce((sum, e) => sum + e.score, 0) / entries.length;

  // Grab the quizTitle/courseTitle from the *first* doc (they should all match)
  const { quizTitle, courseTitle } = entries[0];

  // Map out **all** entries
  const mapped = entries.map((e) => ({
    userName: e.userName,
    score:    e.score,
  }));

  return NextResponse.json({
    quizTitle,
    courseTitle,
    topScore,
    averageScore,
    entries: mapped,
  });
}
