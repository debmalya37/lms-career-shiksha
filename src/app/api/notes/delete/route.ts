import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Note from '@/models/noteModel';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get('id'); // Get the note ID from query params

  if (!noteId) {
    return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
  }

  try {
    await connectMongo();
    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note deleted successfully!' });
  } catch (error) {
    console.error('DELETE /api/notes/delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
