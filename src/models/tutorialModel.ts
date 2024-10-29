import mongoose, { Schema, Document } from 'mongoose';

export interface ITutorial extends Document {
  title: string;
  description: string;
  url: string;
  course: mongoose.Schema.Types.ObjectId;
  subject: mongoose.Schema.Types.ObjectId;
  topic: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const TutorialSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Tutorial || mongoose.model<ITutorial>('Tutorial', TutorialSchema);
