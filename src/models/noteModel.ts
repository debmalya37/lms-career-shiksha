// models/notemodel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  title: string;
  url: string;
  subject: mongoose.Schema.Types.ObjectId; // Reference to Subject
  topic: mongoose.Schema.Types.ObjectId; // Reference to Topic
  createdAt: Date;
}

const NoteSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true }, // Reference to Subject
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true }, // Reference to Topic
  createdAt: { type: Date, default: Date.now },
});

const Note = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
export default Note;
