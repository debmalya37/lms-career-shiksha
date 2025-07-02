import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  sessionToken: string;
  course: Types.ObjectId[];
  purchaseHistory: PurchaseRecord[];
  subscription?: number;
  profile: Types.ObjectId[];
  phoneNo?: string;
  address?: string;
  deviceIdentifier?: string | null ,
  resetOTP: string | null;
resetOTPExpires: Date | null;
  createdAt: Date;
}

export interface PurchaseRecord {
  course: Types.ObjectId;
  amount: number;
  transactionId: string;
  purchasedAt: Date;
  promoCode?: string;  
}

const purchaseSchema = new Schema<PurchaseRecord>(
  {
    course:         { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    amount:         { type: Number, required: true },
    transactionId:  { type: String, required: true },
    purchasedAt:    { type: Date,   default: Date.now },
    promoCode:      { type: String, required: false, default: null },
  },
  { _id: false }
);

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: [/.+\@.+\..+/, 'Please use a valid email address'] },
  password: { type: String, required: true },
  sessionToken: { type: String, default: null },
  course: [{ type: Schema.Types.ObjectId, ref: "Course" }], // Correct type for an array of references
  purchaseHistory: [purchaseSchema],
  subscription: { type: Number, required: false },
  profile: [{ type: Schema.Types.ObjectId, ref: 'Profile' }], // Correct type for an array of references
  phoneNo: { type: String, required: false }, // New field
  address: { type: String, required: false },
  deviceIdentifier: { type: String, default: null },
  resetOTP:         { type: String, default: null },
  resetOTPExpires:  { type: Date,   default: null },
},
{ timestamps: true } 
);

export const User: Model<User> = mongoose.models.User || mongoose.model<User>('User', userSchema);
