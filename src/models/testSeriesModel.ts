// /models/testSeriesModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITestSeries extends Document {
  title: string;
  googleFormLink: string;
  course: mongoose.Schema.Types.ObjectId; // Reference to Course
  subject: mongoose.Schema.Types.ObjectId; // Reference to Subject
}

const TestSeriesSchema = new Schema({
  title: { type: String, required: true },
  googleFormLink: { type: String, required: false },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
}, { timestamps: true });

const TestSeries = mongoose.models.TestSeries || mongoose.model<ITestSeries>('TestSeries', TestSeriesSchema);

export default TestSeries;
