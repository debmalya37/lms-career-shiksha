// app/api/admission/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import {User} from "@/models/user";           // ← make sure this path is correct
import Admission from "@/models/admissionModel";

export async function GET(req: NextRequest) {
  await connectMongo();

  const sessionToken = req.cookies.get("sessionToken")?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Step 1: Find the user by sessionToken
    const user = await User.findOne({ sessionToken }).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Step 2: Find the latest admission record for this user
    const admission = await Admission.findOne({ email: user.email })
      .sort({ createdAt: -1 })
      .lean();

    if (!admission) {
      return NextResponse.json({ error: "No admission found" }, { status: 404 });
    }

    return NextResponse.json(admission);
  } catch (error: any) {
    console.error("Error fetching admission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
