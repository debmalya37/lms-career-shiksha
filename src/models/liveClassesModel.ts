// models/liveClassesModel.ts
import mongoose, { Schema, Document } from 'mongoose';

interface LiveClassDocument extends Document {
  title: string;
  url: string;
  course: mongoose.Types.ObjectId; // Reference to the Course model
  createdAt: Date;
}

const LiveClassSchema = new Schema<LiveClassDocument>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true }, // Reference to the course
  },
  { timestamps: true }
);

export default mongoose.models.LiveClass || mongoose.model<LiveClassDocument>('LiveClass', LiveClassSchema);
