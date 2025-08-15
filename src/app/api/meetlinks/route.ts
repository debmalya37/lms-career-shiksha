import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MeetLink from "@/models/meetLink";

export async function GET() {
  try {
    await dbConnect();
    const links = await MeetLink.find().sort({ createdAt: -1 });
    return NextResponse.json(links);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch meet links" }, { status: 500 });
  }
}
