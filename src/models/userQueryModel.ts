// models/userQueryModel.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserQuery extends Document {
  fullName: string;
  phoneNumber: string;
  interestCourse: string;
  message: string;
  createdAt: Date;
}

const userQuerySchema = new Schema<UserQuery>(
  {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    interestCourse: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const UserQueryModel: Model<UserQuery> =
  mongoose.models.UserQuery || mongoose.model<UserQuery>('UserQuery', userQuerySchema);
export default UserQueryModel;
