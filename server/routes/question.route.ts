import { Router } from "express";
import validateJWT from "../middlewares/validate-jwt";
import validateSchema from "../middlewares/validate=schema";
import { questionSchema } from "../schemas/question.schema";
import questionController from "../controllers/question.controller";
import { validateQuizUsership } from "../middlewares/validate-quiz-usership";

const questionRouter = Router();

questionRouter.post("/", validateJWT, validateSchema(questionSchema), validateQuizUsership, questionController.createQuestion);
questionRouter.put("/:id", validateJWT, validateSchema(questionSchema), validateQuizUsership, questionController.updateQuestion);
questionRouter.delete("/:id", validateJWT, validateQuizUsership, questionController.deleteQuestion);

export default questionRouter;
