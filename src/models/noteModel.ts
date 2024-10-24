import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  title: string;
  url: string; // The Google Drive URL
  subject: string;
  createdAt: Date;
}

const NoteSchema: Schema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true }, // Store Google Drive URL
  subject: { type: String, required: true }, // New field for subject
  createdAt: { type: Date, default: Date.now },
});

const Note = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
