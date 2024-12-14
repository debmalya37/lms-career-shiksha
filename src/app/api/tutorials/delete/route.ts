// api/tutorials/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Tutorial from '@/models/tutorialModel';
import { isValidObjectId } from 'mongoose';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
  const TutorialId = searchParams.get('id');

    // Validate the ID
    if (!TutorialId) {
      return NextResponse.json({ error: 'tutorialId is needed.' }, { status: 400 });
    }

    // Connect to the database
    await connectMongo();

    // Attempt to delete the tutorial
    const deletedTutorial = await Tutorial.findByIdAndDelete(TutorialId);

    // Check if the tutorial existed
    if (!deletedTutorial) {
      return NextResponse.json({ error: 'Tutorial not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tutorial deleted successfully!' });
  } catch (error) {
    console.error("DELETE /api/tutorials/delete Error:", error);
    return NextResponse.json({ error: 'Failed to delete tutorial' }, { status: 500 });
  }
}
