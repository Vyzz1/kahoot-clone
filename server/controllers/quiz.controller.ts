import { Response } from "express";
import { TypedRequest } from "../types/express";
import { QuizRequest } from "../schemas/quiz.schema";
import quizService from "../services/quiz.service";
import { PagedResult } from "../config/paged-result"; 
import Quiz from "../models/quiz.model";

type Quiz = typeof Quiz.prototype;

class QuizController {
  async createQuiz(req: TypedRequest<{ TBody: QuizRequest }>, res: Response) {
    const quiz = await quizService.createQuiz(req.body, req.user!.userId);
    res.status(201).send(quiz);
  }

  async getQuizById(
    req: TypedRequest<{ TParams: { id: string } }>,
    res: Response
  ) {
    const quiz = await quizService.getQuizById(req.params.id);
    res.send(quiz);
  }

  async updateQuiz(
    req: TypedRequest<{ TParams: { id: string }; TBody: QuizRequest }>,
    res: Response
  ) {
    const quiz = await quizService.updateQuiz(req.params.id, req.body);
    res.send(quiz);
  }

  async deleteQuiz(
    req: TypedRequest<{ TParams: { id: string } }>,
    res: Response
  ) {
    await quizService.deleteQuiz(req.params.id);
    res.status(204).send();
  }

  async getPublicQuizzes(
    req: TypedRequest<{
      TQuery: {
        search?: string;
        page?: string;
        pageSize?: string;
        tags?: string | string[];
        questionType?: string;
      };
    }>,
    res: Response
  ) {
    const {
      search,
      page = "0",
      pageSize = "10",
      tags,
      questionType,
    } = req.query;
    const tagArray = typeof tags === "string" ? [tags] : tags;

    const result = await quizService.getPublicQuizzes(
      search,
      +page,
      +pageSize,
      tagArray,
      questionType
    );

    res.send(result);
  }

  async getMyQuizzes(
    req: TypedRequest<{
      TQuery: {
        search?: string;
        page?: string;
        pageSize?: string;
        tags?: string | string[];
        questionType?: string;
      };
    }>,
    res: Response
  ) {
    const {
      search,
      page = "0",
      pageSize = "10",
      tags,
      questionType,
    } = req.query;
    const tagArray = typeof tags === "string" ? [tags] : tags;

    const result = await quizService.getQuizzesByUser(
      req.user!.userId,
      search,
      +page,
      +pageSize,
      tagArray,
      questionType
    ) ;

    res.send(result);
  }
}

export default new QuizController();
