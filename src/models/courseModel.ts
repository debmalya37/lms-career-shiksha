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
  duration: number; // in days, default is 20 years (20 * 365 days)
  introVideo: string;
  
  // EMI-specific fields
  emiEnabled: boolean;
  emiPrice: number; // Total price when buying via EMI (can be higher than regular price)
  emiOptions: {
    months: number;
    monthlyAmount: number;
    processingFee: number;
  }[];
  emiProcessingFeePercentage: number; // Extra fee percentage for EMI purchases
  emiMinimumAmount: number; // Minimum course price to enable EMI
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
  discountedPrice:  { type: Number,  required: true, default: 0 },
  duration:         { type: Number, required: true, default: 20 * 365 },
  introVideo:       { type: String, default: "" },
  
  // EMI fields
  emiEnabled:       { type: Boolean, default: false },
  emiPrice:         { type: Number, default: 0 }, // Price when bought via EMI
  emiOptions:       [{
    months:         { type: Number, required: true },
    monthlyAmount:  { type: Number, required: true },
    processingFee:  { type: Number, default: 0 }
  }],
  emiProcessingFeePercentage: { type: Number, default: 10 }, // 10% extra for EMI
  emiMinimumAmount: { type: Number, default: 1000 }, // Minimum ₹1000 for EMI
});

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export default Course;