import { Schema, model, Types } from "mongoose";

const questionSchema = new Schema(
  {
    quiz: { type: Types.ObjectId, ref: "Quiz", required: true },
    type: {
      type: String,
      enum: ["multiple_choice", "true_false", "ordering", "short_answer", "poll"],
      required: true,
    },
    content: { type: String, required: true },
    media: {
      image: { type: String },
      video: { type: String },
    },
    timeLimit: { type: Number, default: 30 },
    options: [
      {
        text: String,
        isCorrect: Boolean,
      },
    ],
    correctOrder: [String],
    answerText: String,
  },
  { timestamps: true }
);

export default model("Question", questionSchema);
