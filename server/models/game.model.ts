import { Schema, model } from "mongoose";

const gameSchema = new Schema(
  {
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    players: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["waiting", "in_progress", "finished"],
      default: "waiting",
    },

    pin: { type: String, required: true, unique: true },

    questionStartTime: { type: Date },

    startedAt: { type: Date },

    finishedAt: { type: Date },

    settings: {
      showLeaderboard: { type: Boolean, default: true },
      showCorrectAnswer: { type: Boolean, default: true },
      randomizeQuestions: { type: Boolean, default: false },
      randomizeAnswers: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    statics: {
      findByPin: async function (pin: string) {
        return this.findOne({ pin });
      },
    },
  }
);

const GameModel = model("Game", gameSchema);
export default GameModel;
