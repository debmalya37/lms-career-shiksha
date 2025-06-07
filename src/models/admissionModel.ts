// models/admissionModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmission extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  name: string;
  fatherName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  state: string;
  dob: Date;
  profileImageUrl: string;
  aadhaarImageUrl: string;
  aadhaarNumber: string;
  createdAt: Date;
}

const AdmissionSchema = new Schema<IAdmission>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId:      { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    name:          { type: String, required: true },
    fatherName:    { type: String, required: true },
    phone:         { type: String, required: true },
    email:         { type: String, required: true },
    address1:      { type: String, required: true },
    address2:      { type: String, required: false },
    state:         { type: String, required: true },
    dob:           { type: Date,   required: true },
    profileImageUrl: { type: String, required: true },
    aadhaarImageUrl: { type: String, required: true },
    aadhaarNumber: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Admission ||
  mongoose.model<IAdmission>('Admission', AdmissionSchema);
