// models/quizSubmissionModel.ts
import mongoose, { Schema, Document } from 'mongoose';

interface AnswerSubmission {
  questionId: string;
  questionType: 'mcq' | 'descriptive';
  selectedAnswer?: string; // For MCQ
  descriptiveAnswer?: string; // For descriptive questions
  marks: number; // Maximum marks for this question
  isCorrect?: boolean; // For MCQ (auto-evaluated)
  marksAwarded?: number; // Actual marks awarded by teacher
  teacherFeedback?: string; // Teacher's feedback
  needsReview: boolean; // Whether this answer needs teacher review
}

interface QuizSubmissionDocument extends Document {
  quizId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  courseId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  quizTitle: string;
  answers: AnswerSubmission[];
  totalScore: number; // Current total score (MCQ + reviewed descriptive)
  maxScore: number; // Maximum possible score
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  status: 'pending_review' | 'reviewed' | 'partially_reviewed';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  submittedAt: Date;
  finalScore?: number; // Final score after all reviews
  teacherGeneralFeedback?: string; // Overall feedback from teacher
}

const AnswerSubmissionSchema = new Schema({
  questionId: { type: String, required: true },
  questionType: { 
    type: String, 
    enum: ['mcq', 'descriptive'], 
    required: true 
  },
  selectedAnswer: { type: String },
  descriptiveAnswer: { type: String },
  marks: { type: Number, required: true },
  isCorrect: { type: Boolean },
  marksAwarded: { type: Number },
  teacherFeedback: { type: String },
  needsReview: { type: Boolean, default: false }
});

const QuizSubmissionSchema = new Schema({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  quizTitle: { type: String, required: true },
  answers: [AnswerSubmissionSchema],
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  skippedQuestions: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending_review', 'reviewed', 'partially_reviewed'],
    default: 'pending_review'
  },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  submittedAt: { type: Date, default: Date.now },
  finalScore: { type: Number },
  teacherGeneralFeedback: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.QuizSubmission || mongoose.model<QuizSubmissionDocument>('QuizSubmission', QuizSubmissionSchema);

