// models/tutorialModel.ts
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

const Tutorial = mongoose.models.Tutorial || mongoose.model<ITutorial>('Tutorial', TutorialSchema);
export default Tutorial;
