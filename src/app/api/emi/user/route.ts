import { NextRequest, NextResponse } from "next/server";
import EMI from "@/models/emiModel";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";

export async function GET(req: NextRequest) {
  await dbConnect();
  const sessionToken = req.cookies.get("sessionToken")?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let user;
  try {
    // Step 1: Find the user by sessionToken
    user = await User.findOne({ sessionToken }).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  try {
    // Step 2: Fetch EMIs for that user
    const emis = await EMI.find({
      userId: user._id,
      status: { $in: ["active", "overdue"] },
    }).populate("courseId", "title courseImg");

    return NextResponse.json(emis);
  } catch (error: any) {
    console.error("Error fetching EMIs:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
