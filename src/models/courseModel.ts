// models/courseModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  subjects: mongoose.Schema.Types.ObjectId[]; // References to associated subjects
  createdAt: Date;
}

const CourseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }], // Array of subjects
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export default Course;
