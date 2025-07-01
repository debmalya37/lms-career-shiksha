// models/quizResultModel.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer {
  questionIndex: number;
  questionId: string;
  questionTitle: string;
  userAnswer: string;
  correctAnswer: string;
  marks: number;
  image?: string;
}

export interface IQuizResult extends Document {
  quizTitle: string;
  userName: string;
  userEmail: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  answers?: IAnswer[];
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionIndex:   { type: Number, required: true },
  questionId:      { type: String, required: true },
  questionTitle:   { type: String, required: true },
  userAnswer:      { type: String, default: "skipped" },
  correctAnswer:   { type: String, required: true },
  marks:           { type: Number, required: true },
  image:           { type: String }, // optional
}, { _id: false });

const QuizResultSchema = new Schema<IQuizResult>({
  quizTitle:        { type: String, required: true },
  userName:         { type: String, required: true },
  userEmail:        { type: String, required: true },
  score:            { type: Number, required: true },
  correctAnswers:   { type: Number, required: true },
  incorrectAnswers: { type: Number, required: true },
  answers:          { type: [AnswerSchema] },
}, { timestamps: true });

export default mongoose.models.QuizResult ||
  mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
