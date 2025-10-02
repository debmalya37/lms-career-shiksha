import mongoose, { Schema, Document, Types } from "mongoose";

export interface MeetLink extends Document {
  title: string;
  link: string;
  courseIds: Types.ObjectId[];
  thumbnail?: string; // new field
  createdAt: Date;
}

const MeetLinkSchema = new Schema<MeetLink>({
  title: { type: String, required: true },
  link: { type: String, required: true },
  courseIds: [{ type: Schema.Types.ObjectId, ref: "Course", required: true }],
  thumbnail: { type: String }, // Cloudinary URL
  createdAt: { type: Date, default: Date.now },
});

const MeetLink = mongoose.models.MeetLink || mongoose.model<MeetLink>("MeetLink", MeetLinkSchema);
export default MeetLink;
