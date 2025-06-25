// models/preAdmissionModel.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPreAdmission extends Document {
  courseId:      Types.ObjectId;
  email:         string;
  name:              string;
  gender:        'male' | 'female' | 'other';
  phone:         string;
  fatherName:    string;
  address1:      string;
  address2?:         string;
  pincode:       string;
  state:         string;
  city:          string;
  transactionId:     string;
  createdAt:     Date;
  updatedAt:     Date;
}

const PreAdmissionSchema = new Schema<IPreAdmission>(
  {
    courseId:   { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    email:      { type: String, required: true },
    name:            { type: String, required: true },
    gender:     { type: String, enum: ['male','female','other'], required: true },
    phone:      { type: String, required: true },
    fatherName: { type: String, required: true },
    address1:   { type: String, required: true },
    address2:        { type: String },
    pincode:    { type: String, required: true },
    state:      { type: String, required: true },
    city:       { type: String, required: true },
    transactionId:   { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.PreAdmission ||
  mongoose.model<IPreAdmission>('PreAdmission', PreAdmissionSchema);
