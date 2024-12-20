// src/app/api/tutorial/[tutorialId]/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import Tutorial from "@/models/tutorialModel";

export async function GET(req: Request, { params }: { params: { tutorialId: string } }) {
  try {
    await connectMongo();

    const tutorial = await Tutorial.findById(params.tutorialId)
      .select("title description url")
      .lean();

    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    return NextResponse.json(tutorial);
  } catch (error) {
    console.error("Error fetching tutorial:", error);
    return NextResponse.json({ error: "Failed to fetch tutorial" }, { status: 500 });
  }
}
