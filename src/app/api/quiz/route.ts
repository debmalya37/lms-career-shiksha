import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Quiz from '@/models/quizModel'; // Model to store quiz data
import Course from '@/models/courseModel';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const subjectId = searchParams.get('subjectId');
  const quizId = searchParams.get('quizId'); // Get quizId from searchParams

  try {
    await connectMongo();

    let quizzes;
    if (quizId) {
      // If quizId is provided, fetch only that specific quiz
      quizzes = await Quiz.findOne({ _id: quizId, course: courseId, subject: subjectId }).lean();
    } else {
      // If no quizId, fetch all quizzes for the given course and subject
      quizzes = await Quiz.find({ course: courseId, subject: subjectId }).lean();
    }

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quiz data:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { title, course, subject, questions, negativeMarking, totalTime } = await request.json();

  try {
    await connectMongo();

    const newQuiz = new Quiz({
      title,
      course,
      subject,
      questions,
      negativeMarking,
      totalTime,
    });

    await newQuiz.save();
    return NextResponse.json({ message: 'Quiz added successfully!' });
  } catch (error) {
    console.error('Error adding quiz:', error);
    return NextResponse.json({ error: 'Failed to add quiz' }, { status: 500 });
  }
}
