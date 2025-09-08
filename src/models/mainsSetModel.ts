// models/mainsSetModel.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuestion {
  questionText: string;
  maxMarks: number;
}

export interface ISubmission {
  user: Types.ObjectId;
  answers: {
    questionId: number; // index in the question array
    answerFile: string; // URL of uploaded PDF or image
    marks?: number;
  }[];
  status: "pending" | "submitted" | "reviewed";
  totalMarks?: number;
  reviewedAt?: Date;
}

export interface IMainsSet extends Document {
  course: Types.ObjectId;
  title: string;
  description: string;
  questions: IQuestion[];
  submissions: ISubmission[];
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  maxMarks: { type: Number, required: true },
});

const SubmissionSchema = new Schema<ISubmission>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  answers: [
    {
      questionId: { type: Number, required: true },
      answerFile: { type: String, required: true },
      marks: { type: Number },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "submitted", "reviewed"],
    default: "pending",
  },
  totalMarks: { type: Number, default: 0 },
  reviewedAt: { type: Date },
});

const MainsSetSchema = new Schema<IMainsSet>({
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: { type: String },
  questions: [QuestionSchema],
  submissions: [SubmissionSchema],
  createdAt: { type: Date, default: Date.now },
});

const MainsSet =
  mongoose.models.MainsSet || mongoose.model<IMainsSet>("MainsSet", MainsSetSchema);

export default MainsSet;
