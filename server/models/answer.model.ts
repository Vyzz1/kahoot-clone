import { Schema, model, Types } from "mongoose";

const answerSchema = new Schema(
  {
    game: { type: Types.ObjectId, ref: "Game", required: true },

    question: { type: Types.ObjectId, ref: "Question", required: true },

    player: { type: Types.ObjectId, ref: "User", required: true },

    answer: {
      selectedOptionIndex: { type: Number },

      booleanAnswer: { type: Boolean },

      textAnswer: { type: String },

      orderAnswer: [{ type: String }],

      pollAnswer: { type: String },
    },

    responseTime: { type: Number, required: true },

    pointsEarned: { type: Number, default: 0 },

    isCorrect: { type: Boolean, required: true },

    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    indexes: [
      { game: 1, player: 1 },
      { question: 1, player: 1 },
      { game: 1, question: 1 },
    ],
  }
);

answerSchema.index({ game: 1, question: 1, player: 1 }, { unique: true });

export default model("Answer", answerSchema);
