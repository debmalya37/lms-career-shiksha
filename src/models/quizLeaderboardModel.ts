// models/quizLeaderboardModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizLeaderboard extends Document {
  quizId: mongoose.Types.ObjectId;
  quizTitle: string;
  courseId: mongoose.Types.ObjectId;
  courseTitle: string;
  userEmail: string;
  userName: string;
  score: number;          // the user’s best score on this quiz
  attemptedAt: Date;      // latest attempt timestamp
}

const QuizLeaderboardSchema = new Schema<IQuizLeaderboard>({
  quizId:       { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  quizTitle:    { type: String, required: true },
  courseId:     { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  courseTitle:  { type: String, required: true },
  userEmail:    { type: String, required: true, index: true },
  userName:     { type: String, required: true },
  score:        { type: Number, required: true },
  attemptedAt:  { type: Date, default: Date.now },
});

// ensure one entry per (quizId, userEmail)
QuizLeaderboardSchema.index({ quizId: 1, userEmail: 1 }, { unique: true });

export default mongoose.models.QuizLeaderboard ||
       mongoose.model<IQuizLeaderboard>('QuizLeaderboard', QuizLeaderboardSchema);
