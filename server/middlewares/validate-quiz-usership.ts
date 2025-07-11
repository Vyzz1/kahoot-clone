import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import Quiz from "../models/quiz.model";

// Cho phép bất kỳ ai có token đều tạo câu hỏi
export const validateQuizUsership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const quizId = req.body.quizId || req.params.id;
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
