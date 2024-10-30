import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseSubject extends Document {
  name: string;
  course: mongoose.Schema.Types.ObjectId; // Reference to Course
  subject: mongoose.Schema.Types.ObjectId; // Reference to Subject
  createdAt: Date;
}

const CourseSubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  createdAt: { type: Date, default: Date.now },
});

const CourseSubject = mongoose.models.CourseSubject || mongoose.model<ICourseSubject>('CourseSubject', CourseSubjectSchema);

export default CourseSubject;
