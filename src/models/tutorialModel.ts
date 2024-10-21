import mongoose, { Schema, Document } from 'mongoose';

export interface ITutorial extends Document {
  title: string;
  url: string;
  createdAt: Date;
}

const TutorialSchema: Schema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Export the model and schema
const Tutorial = mongoose.models.Tutorial || mongoose.model<ITutorial>('Tutorial', TutorialSchema);

export default Tutorial;
