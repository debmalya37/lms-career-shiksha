import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sessionToken: { type: String, unique: true },
  profile: { // Link to profile
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
