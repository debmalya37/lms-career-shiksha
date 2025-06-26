// app/api/pre-admission/txn/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";

// Query params:
//   email=student@example.com
//   courseId=674b5...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email    = searchParams.get("email");
  const courseId = searchParams.get("courseId");
  if (!email || !courseId) {
    return NextResponse.json(
      { error: "Both email and courseId are required" },
      { status: 400 }
    );
  }

  await connectMongo();
  // find the user by email
  const user = await User.findOne({ email }).lean();
  if (!user) {
    return NextResponse.json({ transactionId: null });
  }

  // find the matching purchaseHistory entry
  const rec = user.purchaseHistory.find(
    (ph) => ph.course.toString() === courseId
  );
  return NextResponse.json({
    transactionId: rec ? rec.transactionId : null,
  });
}
