import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  url: string; // YouTube embedded link
  subject: mongoose.Schema.Types.ObjectId; // Reference to Subject
  topic: mongoose.Schema.Types.ObjectId; // Reference to Topic
  createdAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true }, // YouTube embedded link
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true }, // Reference to Subject
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true }, // Reference to Topic
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
