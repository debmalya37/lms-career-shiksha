// models/quizModel.ts
import mongoose, { Schema, Document } from 'mongoose';

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
}

interface QuizDocument extends Document {
  title: string;
  course: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  questions: Question[];
  negativeMarking: number;
  totalTime: number;
}

const AnswerSchema = new Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const QuestionSchema = new Schema({
  question: { type: String, required: true },
  answers: [AnswerSchema],
});

const QuizSchema = new Schema({
  title: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  questions: [QuestionSchema],
  negativeMarking: { type: Number, required: true },
  totalTime: { type: Number, required: true },
});

export default mongoose.models.Quiz || mongoose.model<QuizDocument>('Quiz', QuizSchema);
