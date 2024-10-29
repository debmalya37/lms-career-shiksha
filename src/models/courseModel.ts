import mongoose, { Schema, Document } from 'mongoose';
import Topic from './topicModel';
export interface ICourse extends Document {
  title: string;
  description: string;
  url: string; // YouTube embedded link
  subject: mongoose.Schema.Types.ObjectId; // Reference to Subject
  createdAt: Date;
}

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);

export default Course;
