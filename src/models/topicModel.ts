// models/topicModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  name: string;
  subject: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const TopicSchema = new Schema({
  name: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Topic = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);
export default Topic;
