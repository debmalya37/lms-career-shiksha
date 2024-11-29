// models/courseModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  subjects: Types.ObjectId[]; // Array of ObjectIds referencing Subject documents
  courseImg: string; 
  createdAt: Date;
  isHidden: boolean;
}

const CourseSchema = new Schema({
  title: { type: String, required: true, unique:true },
  description: { type: String, required: true },
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }], // Reference Subject IDs here
  courseImg: { type: String },
  createdAt: { type: Date, default: Date.now },
  isHidden: { type: Boolean, default: false },
});

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export default Course;
