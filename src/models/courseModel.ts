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
  price: number;
  isFree: boolean;
  discountedPrice: number;  
  duration:  number; // in days, default is 20 years (20 * 365 days)
  introVideo: string;
}

const CourseSchema = new Schema({
  title:            { type: String,  required: true, unique: true },
  description:      { type: String,  required: true },
  subjects:         [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  courseImg:        { type: String },
  createdAt:        { type: Date,    default: Date.now },
  isHidden:         { type: Boolean, default: false },
  price:            { type: Number,  required: true, default: 0 },
  isFree:           { type: Boolean, required: true, default: false },
  discountedPrice:  { type: Number,  required: true, default: 0 },   // <-- new
  duration:         { type: Number, required: true, default: 20 * 365 },
  introVideo:       { type: String, default: "" },
});

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export default Course;
