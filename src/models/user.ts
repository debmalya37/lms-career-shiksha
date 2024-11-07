// models/userModel.ts (or similar)
import mongoose, { Types } from 'mongoose';

export interface User extends Document{
  name: string;
  email: string;
  password: string;
  sessionToken: string;
  course: Types.ObjectId[];
  profile:  Types.ObjectId[];
  subscription: number;
}
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match:[/.+\@.+\..+/, 'Please use a valid email address'] },
  password: { type: String, required: true },
  sessionToken: { type: String, unique: true },
  course: 
  {type: mongoose.Schema.Types.ObjectId,
  ref: "Course"
  },
  profile: { // Link to profile
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
  subscription: { type: Number, required: true },
});

export const User = mongoose.models.User|| mongoose.model<User>('User', userSchema);
