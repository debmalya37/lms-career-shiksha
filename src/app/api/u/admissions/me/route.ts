// File: app/api/admission/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import { User } from "@/models/user";
import Admission, { IAdmission } from "@/models/admissionModel";

export async function GET(req: NextRequest) {
  // 1) Connect to Mongo
  await connectMongo();

  // 2) Check sessionToken
  const sessionToken = req.cookies.get("sessionToken")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // 3) Find user by sessionToken
    const user = await User.findOne({ sessionToken }).lean<User | null>();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4) Fetch all admissions for that user's email, newest first
    const admissions = await Admission
      .find({ email: user.email })
      .sort({ createdAt: -1 })
      .lean<IAdmission[]>();

    // 5) Return the array (could be empty)
    return NextResponse.json(admissions);
  } catch (err: any) {
    console.error("Error fetching admissions:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
