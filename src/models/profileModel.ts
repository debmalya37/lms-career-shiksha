import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: string; // Reference to the user
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  aim: string;
}

const ProfileSchema = new Schema<IProfile>({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  aim: { type: String, required: true },
});

const Profile = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
export default Profile;
