// /models/testSeriesModel.js

import mongoose from 'mongoose';

const TestSeriesSchema = new mongoose.Schema({
  // question: { type: String, required: false }, // Make required: true if it's mandatory
  // correctAnswer: { type: String, required: false }, // Make required: true if it's mandatory
  // options: { type: [String], required: false }, // Array of options
  subject: { type: String, required: true }, // Assuming subject is mandatory
  googleFormLink: { type: String, required: false }, // Add this line
}, { timestamps: true });

export default mongoose.models.TestSeries || mongoose.model('TestSeries', TestSeriesSchema);
