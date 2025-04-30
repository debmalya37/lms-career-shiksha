// src/app/api/enroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";

export async function POST(request: NextRequest) {
  await dbConnect();

  // 1) extract sessionToken from the cookie
  const sessionToken = request.cookies.get("sessionToken")?.value;
  if (!sessionToken) {
    return NextResponse.json(
      { error: "Unauthorized: No session token provided." },
      { status: 401 }
    );
  }

  // 2) look up the user by that token
  const user = await User.findOne({ sessionToken });
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid session." },
      { status: 401 }
    );
  }

  // 3) read courseId from the POST body
  const { courseId } = await request.json();
  if (!courseId) {
    return NextResponse.json(
      { error: "Bad Request: courseId is required." },
      { status: 400 }
    );
  }

  // 4) add it to the user's courses array if not already present
  await User.updateOne(
    { _id: user._id },
    { $addToSet: { course: courseId } }
  );

  return NextResponse.json({ success: true });
}
