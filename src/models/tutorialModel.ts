import mongoose, { Schema, Document } from 'mongoose';

export interface ITutorial extends Document {
  title: string;
  description: string;
  url: string;
  subject: mongoose.Schema.Types.ObjectId;
  topic: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const TutorialSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Virtual field for course
TutorialSchema.virtual('course', {
  ref: 'Course', // Reference the Course model
  localField: 'subject', // Match subject in the Tutorial model
  foreignField: '_id', // Match _id in the Subject model
  justOne: true, // Expect a single course
});

TutorialSchema.set('toObject', { virtuals: true });
TutorialSchema.set('toJSON', { virtuals: true });

const Tutorial = mongoose.models.Tutorial || mongoose.model<ITutorial>('Tutorial', TutorialSchema);
export default Tutorial;
