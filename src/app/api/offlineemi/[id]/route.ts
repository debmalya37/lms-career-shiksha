import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OfflineEMI from "@/models/offlineEmiModel";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const data = await req.json();
  const updated = await OfflineEMI.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  await OfflineEMI.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
