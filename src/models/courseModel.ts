// models/courseModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  subjects: Types.ObjectId[];
  courseImg: string;
  createdAt: Date;
  isHidden: boolean;
  /** New fields: */
  price: number;
  isFree: boolean;
}

const CourseSchema = new Schema({
  title:       { type: String,  required: true, unique: true },
  description: { type: String,  required: true },
  subjects:    [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  courseImg:   { type: String },
  createdAt:   { type: Date,    default: Date.now },
  isHidden:    { type: Boolean, default: false },
  price:       { type: Number,  required: true, default: 0 },
  isFree:      { type: Boolean, required: true, default: false },
});

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export default Course;
