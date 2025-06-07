import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Leaderboard from "@/models/Leaderboard";

export async function GET() {
  await dbConnect();

  try {
    const entries = await Leaderboard.find({}, "-_id userName averageScore quizCount").lean();
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json([], { status: 500 });
  }
}
