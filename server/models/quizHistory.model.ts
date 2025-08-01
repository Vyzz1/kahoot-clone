import mongoose from "mongoose";

const quizHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  quiz: { type: mongoose.Types.ObjectId, ref: "Quiz", required: true },
  answers: Array,
  totalTime: Number,
  score: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("QuizHistory", quizHistorySchema);
