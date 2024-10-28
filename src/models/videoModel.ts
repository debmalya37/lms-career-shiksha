import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  subject: mongoose.Schema.Types.ObjectId; // Reference to Subject
  topic: mongoose.Schema.Types.ObjectId; // Reference to Topic
  videoUrl: string;
  description: string;
  createdAt: Date;
}

const VideoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  videoUrl: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Video = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);

export default Video;
