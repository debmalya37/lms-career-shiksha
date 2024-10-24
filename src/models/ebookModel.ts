import mongoose, { Schema, Document } from 'mongoose';

export interface IEBook extends Document {
  title: string;
  url: string; // Google Drive URL
  subject: string; // Subject the eBook belongs to
  createdAt: Date;
}

const EBookSchema: Schema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true }, // Google Drive URL
  subject: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const EBook = mongoose.models.EBook || mongoose.model<IEBook>('EBook', EBookSchema);

export default EBook;
