// models/promoCodeModel.ts
// models/promoCodeModel.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  discountType: 'percentage' | 'amount';
  discountValue: number;
  expiresAt: Date;
  usageLimit: number;
  usedCount: number;
  applicableCourses: Types.ObjectId[]; // empty = general
  createdAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>({
  code:           { type: String, required: true, unique: true },
  discountType:   { type: String, enum: ['percentage','amount'], required: true },
  discountValue:  { type: Number, required: true },
  expiresAt:      { type: Date, required: true },
  usageLimit:     { type: Number, required: true },
  usedCount:      { type: Number, default: 0 },
  applicableCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  createdAt:      { type: Date, default: Date.now }
});

export default mongoose.models.PromoCode ||
       mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);