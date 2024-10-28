import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  createdAt: Date;
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Subject = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);

export default Subject;
