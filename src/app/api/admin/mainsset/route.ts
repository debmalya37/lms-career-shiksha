import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MainsSet from "@/models/mainsSetModel";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  const mainsSet = await MainsSet.create(body);
  return NextResponse.json(mainsSet, { status: 201 });
}

export async function GET() {
  await dbConnect();
  const mainsSets = await MainsSet.find().populate("course");
  return NextResponse.json(mainsSets);
}
