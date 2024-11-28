import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Quiz from '@/models/quizModel';

export async function DELETE(request: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    const questionId = searchParams.get('questionId');

    if (!quizId || !questionId) {
      return NextResponse.json({ error: 'Quiz ID and Question ID are required' }, { status: 400 });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    quiz.questions = quiz.questions.filter((question: { _id: { toString: () => string; }; }) => question._id.toString() !== questionId);

    await quiz.save();

    return NextResponse.json({ message: 'Question deleted successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
