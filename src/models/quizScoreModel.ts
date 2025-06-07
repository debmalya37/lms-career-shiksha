// models/quizScoreModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizScore extends Document {
  userId:    mongoose.Types.ObjectId;
  quizId:    mongoose.Types.ObjectId;
  score:     number;
  total:     number;
  takenAt:   Date;
}

const QuizScoreSchema = new Schema<IQuizScore>({
  userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId:  { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score:   { type: Number, required: true },
  total:   { type: Number, required: true },
  takenAt: { type: Date,   default: () => new Date() },
});

// Prevent duplicate entries per user/quiz—only keep highest
QuizScoreSchema.index({ userId: 1, quizId: 1 }, { unique: true });

export default mongoose.models.QuizScore ||
       mongoose.model<IQuizScore>('QuizScore', QuizScoreSchema);
