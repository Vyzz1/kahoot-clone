import mongoose, { Schema, model, Types } from "mongoose";

const quizResultSchema = new Schema(
  {
    quiz: { type: Types.ObjectId, ref: "Quiz", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    timeTaken: { type: Number, required: true }, 
    submittedAt: { type: Date, default: Date.now },
    answer: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        selected: { type: String, required: true },
        correct: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);

const QuizResult = model("QuizResult", quizResultSchema);
export default QuizResult;
