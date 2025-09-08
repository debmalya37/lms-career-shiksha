// app/api/admin/mainsset/[id]/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/lib/db";
import MainsSet from "@/models/mainsSetModel";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    const body = await req.json();
    const id = params.id;
    const { course, title, description, questions } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const update: any = {};
    if (course) update.course = course;
    if (title) update.title = title;
    if (description !== undefined) update.description = description;
    if (Array.isArray(questions)) update.questions = questions;

    const updated = await MainsSet.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Updated", mains: updated });
  } catch (err) {
    console.error("PUT /api/admin/mainsset/[id] error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
