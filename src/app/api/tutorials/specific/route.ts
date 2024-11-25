import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import Tutorial from "@/models/tutorialModel";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url); // Extract query parameters safely
    const subjectIds = searchParams.get("subjectIds")?.split(",");

    await connectMongo();

    const query = subjectIds ? { subject: { $in: subjectIds } } : {};
    const tutorials = await Tutorial.find(query).lean();

    return NextResponse.json(tutorials);
  } catch (error) {
    console.error("GET /api/tutorials/specific Error:", error);
    return NextResponse.json({ error: "Failed to fetch tutorials" }, { status: 500 });
  }
}
