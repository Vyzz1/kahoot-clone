import { Router } from "express";
import validateJWT from "../middlewares/validate-jwt";
import validateSchema from "../middlewares/validate-schema";
import { quizSchema } from "../schemas/quiz.schema";
import quizController from "../controllers/quiz.controller";

const quizRouter = Router();

quizRouter.post(
  "/",
  validateJWT,
  validateSchema(quizSchema),
  quizController.createQuiz
);
quizRouter.get("/:id", validateJWT, quizController.getQuizById);
quizRouter.put(
  "/:id",
  validateJWT,
  validateSchema(quizSchema),
  quizController.updateQuiz
);
quizRouter.delete("/:id", validateJWT, quizController.deleteQuiz);

quizRouter.get("/public/list", quizController.getPublicQuizzes);
quizRouter.get("/my/list", validateJWT, quizController.getMyQuizzes);

export default quizRouter;
