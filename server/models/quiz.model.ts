import { Schema, model, Types } from "mongoose";

const quizSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  user: { type: Types.ObjectId, ref: "User", required: true }, 
  isPublic: { type: Boolean, default: false },
  questions: [{ type: Types.ObjectId, ref: "Question" }],
  tags: [{ type: String }],
}, { timestamps: true });

export default model("Quiz", quizSchema);