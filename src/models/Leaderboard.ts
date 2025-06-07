import mongoose from "mongoose";

const LeaderboardSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  totalScore: { type: Number, default: 0 },
  quizCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
});

export default mongoose.models.Leaderboard ||
  mongoose.model("Leaderboard", LeaderboardSchema);
