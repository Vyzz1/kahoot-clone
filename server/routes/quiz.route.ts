import { Router } from "express";
import validateJWT from "../middlewares/validate-jwt";
import validateSchema from "../middlewares/validate-schema";
import { quizSchema } from "../schemas/quiz.schema";
import quizController from "../controllers/quiz.controller";
import { questionSchema } from "../schemas/question.schema";

const quizRouter = Router();

quizRouter.post("/", validateJWT, validateSchema(quizSchema),  quizController.createQuiz);
quizRouter.get("/", quizController.getFilteredQuizzes);
quizRouter.get("/public/list", quizController.getFilteredQuizzes);
quizRouter.get("/my/list", validateJWT, quizController.getMyQuizzes);
quizRouter.get("/:id/questions", quizController.getQuestionsByQuizId);
quizRouter.post("/:id/questions", validateJWT, validateSchema(questionSchema), quizController.addQuestionToQuiz);
quizRouter.get("/:id", validateJWT, quizController.getQuizById);
quizRouter.put("/:id", validateJWT, validateSchema(quizSchema), quizController.updateQuiz);
quizRouter.delete("/:id", validateJWT, quizController.deleteQuiz);



export default quizRouter;