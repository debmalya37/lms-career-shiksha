import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  title: string;
  filePath: string;
  createdAt: Date;
}

const NoteSchema: Schema = new Schema({
  title: { type: String, required: true },
  filePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Export the model and schema
const Note = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
