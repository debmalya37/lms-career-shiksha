// models/subjectModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  courses: mongoose.Schema.Types.ObjectId[]; // Array of courses this subject belongs to
  subjectImg?: string;
  createdAt: Date;
  isHidden: boolean;

}

const SubjectSchema: Schema<ISubject>  = new Schema({
  name: { type: String, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }], // Array of course references
  subjectImg: { type: String },
  createdAt: { type: Date, default: Date.now },
  isHidden: { type: Boolean, default: false },
});

const Subject = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
export default Subject;
