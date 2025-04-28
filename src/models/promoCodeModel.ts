// models/promoCodeModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  discountType: 'percentage' | 'amount';
  discountValue: number;
  expiresAt: Date;
  usageLimit: number;      // max total uses
  usedCount: number;       // increments on each use
  createdAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>({
  code:           { type: String, required: true, unique: true },
  discountType:   { type: String, enum: ['percentage','amount'], required: true },
  discountValue:  { type: Number, required: true },
  expiresAt:      { type: Date, required: true },
  usageLimit:     { type: Number, required: true },
  usedCount:      { type: Number, default: 0 },
  createdAt:      { type: Date, default: Date.now }
});

export default mongoose.models.PromoCode ||
       mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);
