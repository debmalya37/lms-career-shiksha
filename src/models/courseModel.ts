// models/courseModel.ts
import mongoose, { Schema, Document } from "mongoose";
import { Types } from "mongoose";

export interface EMIOpt {
  months: number;
  // preferred: array of per-month prices
  monthlyAmounts?: number[];
  // legacy: single monthly amount (kept for compatibility; migration recommended)
  monthlyAmount?: number;
  processingFee?: number;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  subjects: Types.ObjectId[];
  courseImg?: string;
  createdAt: Date;
  isHidden: boolean;
  price: number;
  mainsAvailable?: boolean;
  isFree: boolean;
  discountedPrice: number;
  duration: number;
  introVideo?: string;

  // EMI-specific fields
  emiEnabled: boolean;
  emiPrice: number; // Total price when buying via EMI
  emiOptions: EMIOpt[];
  emiProcessingFeePercentage: number;
  emiMinimumAmount: number;
}

const EMIOptionSchema = new Schema(
  {
    months: { type: Number, required: true },
    // new canonical storage for per-month pricing
    monthlyAmounts: [{ type: Number }],
    // legacy single-value (optional) — kept for transition
    monthlyAmount: { type: Number, required: false },
    processingFee: { type: Number, default: 0 },
  },
  { _id: false }
);

const CourseSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    courseImg: { type: String },
    createdAt: { type: Date, default: Date.now },
    isHidden: { type: Boolean, default: false },
    price: { type: Number, required: true, default: 0 },
    isFree: { type: Boolean, required: true, default: false },
    discountedPrice: { type: Number, required: true, default: 0 },
    duration: { type: Number, required: true, default: 20 * 365 },
    introVideo: { type: String, default: "" },

    // new field
    mainsAvailable: { type: Boolean, default: false },

    // EMI fields
    emiEnabled: { type: Boolean, default: false },
    emiPrice: { type: Number, default: 0 },
    emiOptions: { type: [EMIOptionSchema], default: [] },
    emiProcessingFeePercentage: { type: Number, default: 10 },
    emiMinimumAmount: { type: Number, default: 1000 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Course = mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
export default Course;
