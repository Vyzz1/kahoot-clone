
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import Quiz from "../models/quiz.model";

export const validateQuizOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const quizId = req.body.quizId || req.params.id;
    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.owner?.toString() !== req.user?.id) {
  res.status(403).json({ message: "Forbidden: Not the owner of this quiz" });
  return;
}
    next(); // ✅ OK
  } catch (err) {
    next(err);
  }
};
