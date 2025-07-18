import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import Quiz from "../models/quiz.model";
import mongoose from "mongoose";

// Cho phép bất kỳ ai có token đều tạo câu hỏi
export const validateQuizUsership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const quizId = req.body.quizId || req.params.id;
    console.log("validateQuizUsership quizId:", quizId);

    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      res.status(400).json({ message: "Invalid or missing quizId" });
      return;
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
};