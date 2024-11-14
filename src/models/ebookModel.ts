// models/ebookModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEBook extends Document {
  title: string;
  url: string;
  subject: mongoose.Schema.Types.ObjectId;
  ebookImg: string; // New field for storing the Cloudinary image URL
  createdAt: Date;
}

const EBookSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  ebookImg: { type: String, required: true }, // Add the new field here
  createdAt: { type: Date, default: Date.now },
});

const EBook = mongoose.models.EBook || mongoose.model<IEBook>('EBook', EBookSchema);
export default EBook;
