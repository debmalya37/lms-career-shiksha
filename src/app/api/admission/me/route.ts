// app/api/admission/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import Admission from "@/models/admissionModel";

export async function GET(req: NextRequest) {
  await connectMongo();
  const sessionToken = req.cookies.get("sessionToken")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  // Find the latest admission for this user
  const admission = await Admission
    .findOne({ /* assume your User model link by sessionToken → userId,
                  or you could store userId in cookies too */ })
    .sort({ createdAt: -1 })
    .lean();
  if (!admission) {
    return NextResponse.json({ error: "No admission found" }, { status: 404 });
  }
  return NextResponse.json(admission);
}
