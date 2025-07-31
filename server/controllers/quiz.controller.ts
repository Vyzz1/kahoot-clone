import { Response } from "express";
import { TypedRequest } from "../types/express";
import { QuizRequest } from "../schemas/quiz.schema";
import quizService from "../services/quiz.service";

class QuizController {
  async createQuiz(req: TypedRequest<{ TBody: QuizRequest }>, res: Response) {
    // Ensure req.user is available from authentication middleware
    const quiz = await quizService.createQuiz(req.body, req.user!.userId);
    res.status(201).send(quiz);
  }

  async getQuizById(
    req: TypedRequest<{ TParams: { id: string } }>,
    res: Response
  ) {
    // No user ID needed for public quiz retrieval, assuming service handles public/private logic
    const quiz = await quizService.getQuizById(req.params.id);
    res.send(quiz);
  }

  async updateQuiz(
    req: TypedRequest<{ TParams: { id: string }; TBody: QuizRequest }>,
    res: Response
  ) {
    // Pass userId to service to ensure only owner can update
    const quiz = await quizService.updateQuiz(
      req.params.id,
      req.body,
      req.user!.userId
    );
    res.send(quiz);
  }

  async deleteQuiz(
    req: TypedRequest<{ TParams: { id: string } }>,
    res: Response
  ) {
    // Pass userId to service to ensure only owner can delete
    await quizService.deleteQuiz(req.params.id, req.user!.userId);
    res.status(204).send();
  }

  async getFilteredQuizzes(
    req: TypedRequest<{
      TQuery: {
        search?: string;
        page?: string;
        pageSize?: string;
        tags?: string | string[];
        questionType?: string;
        isPublic?: string;
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
      isPublic,
    } = req.query;

    const tagArray = typeof tags === "string" ? [tags] : tags;

    const parsedIsPublic =
      isPublic === "true" ? true : isPublic === "false" ? false : undefined;

    const result = await quizService.getQuizzesWithFilter(
      search,
      +page,
      +pageSize,
      tagArray,
      questionType,
      parsedIsPublic
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
    );

    res.send(result);
  }
}

export default new QuizController();
