import { Schema, model, Types } from "mongoose";

const gameSessionSchema = new Schema(
  {
    game: { type: Types.ObjectId, ref: "Game", required: true },

    player: { type: Types.ObjectId, ref: "User", required: true },

    displayName: { type: String, required: true },

    totalScore: { type: Number, default: 0 },

    correctAnswers: { type: Number, default: 0 },

    totalAnswered: { type: Number, default: 0 },

    averageResponseTime: { type: Number, default: 0 },

    finalRank: { type: Number },

    joinedAt: { type: Date, default: Date.now },

    finishedAt: { type: Date },

    status: {
      type: String,
      enum: ["active", "disconnected", "finished"],
      default: "active",
    },

    maxStreak: { type: Number, default: 0 },

    currentStreak: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    indexes: [
      { game: 1 },
      { player: 1 },
      { game: 1, totalScore: -1 },
      { game: 1, finalRank: 1 },
    ],
  }
);

gameSessionSchema.index({ game: 1, player: 1 }, { unique: true });

export default model("GameSession", gameSessionSchema);
