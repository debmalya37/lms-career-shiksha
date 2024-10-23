import mongoose, { Schema, Document } from 'mongoose';

export interface ITestSeries extends Document {
  question: string;
  correctAnswer: string;
  options: string[];
  subject: string;
}

const TestSeriesSchema: Schema = new Schema({
  question: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  options: { type: [String], required: true },
  subject: { type: String, required: true },
});

export default mongoose.models.TestSeries || mongoose.model<ITestSeries>('TestSeries', TestSeriesSchema);
