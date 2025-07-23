// models/progressModel.ts
import mongoose, { Schema, Document, Types, Model } from 'mongoose';

export interface IProgress extends Document {
  user:   Types.ObjectId;
  course: Types.ObjectId;
  tutorial: Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
}

const ProgressSchema = new Schema<IProgress>({
  user:     { type: Schema.Types.ObjectId, ref: 'User',   required: true },
  course:   { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  tutorial: { type: Schema.Types.ObjectId, ref: 'Tutorial', required: true },
  completed:   { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true });

// ensure a user can only have one record per tutorial per course
ProgressSchema.index({ user: 1, course: 1, tutorial: 1 }, { unique: true });

const Progress: Model<IProgress> =
  mongoose.models.Progress ||
  mongoose.model<IProgress>('Progress', ProgressSchema);

export default Progress;
