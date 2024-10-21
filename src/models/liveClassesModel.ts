import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveClass extends Document {
  title: string;
  url: string;
  createdAt: Date;
}

const LiveClassSchema: Schema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Export the model and schema
const LiveClass = mongoose.models.LiveClass || mongoose.model<ILiveClass>('LiveClass', LiveClassSchema);

export default LiveClass;
