// /api/tutorial/edit/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';

export async function POST(request: Request) {
  const { _id, title, url, description, subject, topic } = await request.json();

  try {
    await connectMongo();

    const updatedTutorial = await Tutorial.findByIdAndUpdate(
      _id,
      { title, url, description, subject, topic },
      { new: true } // Return the updated document
    );

    if (!updatedTutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tutorial updated successfully!", tutorial: updatedTutorial });
  } catch (error) {
    console.error("POST /api/tutorial/edit Error:", error);
    return NextResponse.json({ error: "Failed to update tutorial" }, { status: 500 });
  }
}
