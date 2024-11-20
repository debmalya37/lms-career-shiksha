import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  sessionToken: string;
  course: Types.ObjectId[];
  subscription: number;
  profile: Types.ObjectId[];
  phoneNo: string;
  address: string;
  deviceIdentifier?: string | null 
}

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: [/.+\@.+\..+/, 'Please use a valid email address'] },
  password: { type: String, required: true },
  sessionToken: { type: String, default: null },
  course: [{ type: Schema.Types.ObjectId, ref: "Course" }], // Correct type for an array of references
  subscription: { type: Number, required: true },
  profile: [{ type: Schema.Types.ObjectId, ref: 'Profile' }], // Correct type for an array of references
  phoneNo: { type: String, required: true }, // New field
  address: { type: String, required: true },
  deviceIdentifier: { type: String, default: null },
});

export const User: Model<User> = mongoose.models.User || mongoose.model<User>('User', userSchema);
