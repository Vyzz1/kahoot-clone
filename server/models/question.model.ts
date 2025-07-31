import { Schema, model, Types, InferSchemaType } from "mongoose";

const questionSchema = new Schema(
  {
    quiz: { type: Types.ObjectId, ref: "Quiz", required: true },
    type: {
      type: String,
      enum: [
        "multiple_choice",
        "true_false",
        "ordering",
        "short_answer",
        "poll",
      ],
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
    points: { type: Number, default: 1 },

    user: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export type QuestionDocument = InferSchemaType<typeof questionSchema>;

export default model("Question", questionSchema);
