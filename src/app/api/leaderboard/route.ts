import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Leaderboard from "@/models/Leaderboard"; // create this model

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const { userEmail, userName, quizId, quizTitle, score } = body;

    // Find if user already exists
    let record = await Leaderboard.findOne({ userEmail });

    if (record) {
      // Update average and count
      const newTotal = record.totalScore + score;
      const newCount = record.quizCount + 1;
      record.averageScore = newTotal / newCount;
      record.totalScore = newTotal;
      record.quizCount = newCount;
    } else {
      // First time
      record = new Leaderboard({
        userEmail,
        userName,
        quizCount: 1,
        totalScore: score,
        averageScore: score,
      });
    }

    await record.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving to leaderboard:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
