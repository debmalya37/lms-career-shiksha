import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  name: string;
  subject: mongoose.Schema.Types.ObjectId; // Reference to Subject
  createdAt: Date;
}

const TopicSchema: Schema = new Schema({
  name: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true }, // Reference to Subject
  createdAt: { type: Date, default: Date.now },
});

const Topic = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);

export default Topic;
