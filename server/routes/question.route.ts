import { Router } from "express";
import validateJWT from "../middlewares/validate-jwt";
import validateSchema from "../middlewares/validate-schema";
import { questionSchema } from "../schemas/question.schema";
import questionController from "../controllers/question.controller";
import { validateQuizOwnership } from "../middlewares/validate-quiz-ownership";

const questionRouter = Router();

questionRouter.post(
  "/",
  validateJWT,
  validateSchema(questionSchema),
  validateQuizOwnership,
  questionController.createQuestion
);
questionRouter.put(
  "/:id",
  validateJWT,
  validateSchema(questionSchema),
  validateQuizOwnership,
  questionController.updateQuestion
);
questionRouter.delete(
  "/:id",
  validateJWT,
  validateQuizOwnership,
  questionController.deleteQuestion
);

export default questionRouter;
