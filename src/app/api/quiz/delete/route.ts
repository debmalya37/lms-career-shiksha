import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Quiz from '@/models/quizModel';

export async function DELETE(request: NextRequest) {
        try {
    await connectMongo();
    
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    
        if (!quizId) {
    return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }
    
        const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
    
        if (!deletedQuiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Quiz deleted successfully!' }, { status: 200 });
    } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
    }
}
