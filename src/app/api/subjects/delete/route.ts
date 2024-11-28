import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Subject from '@/models/subjectModel';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('id'); // Get the subject ID from query params

  if (!subjectId) {
    return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
  }

  try {
    await connectMongo();
    const deletedSubject = await Subject.findByIdAndDelete(subjectId);

    if (!deletedSubject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subject deleted successfully!' });
  } catch (error) {
    console.error('DELETE /api/subjects/delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
