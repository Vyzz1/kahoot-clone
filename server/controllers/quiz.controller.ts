import { Response } from "express";
import { TypedRequest } from "../types/express";
import { QuizRequest } from "../schemas/quiz.schema";
import quizService from "../services/quiz.service";
import Question from "../models/question.model";
import QuizHistory from "../models/quizHistory.model"; // (tùy chọn nếu bạn lưu lịch sử quiz)

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

  async getQuestionsByQuizId(
    req: TypedRequest<{ TParams: { id: string } }>,
    res: Response
  ) {
    try {
      const questions = await Question.find({ quiz: req.params.id }).sort({ order: 1 });
      res.send(questions);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách câu hỏi", error });
    }
  }

  async submitQuizResult(
    req: TypedRequest<{ TParams: { id: string }; TBody: { answers: any[]; totalTime: number } }>,
    res: Response
  ) {
    const { id } = req.params;
    const { answers, totalTime } = req.body;
    const userId = req.user!.userId;

    const score = answers.reduce((acc, a) => acc + (a.score || 0), 0);

    try {
      await QuizHistory.create({
        user: userId,
        quiz: id,
        answers,
        totalTime,
        score,
      });

      res.status(200).send({ message: "Kết quả đã được ghi nhận." });
    } catch (error) {
      console.error("Lỗi khi lưu lịch sử quiz:", error);
      res.status(500).send({ message: "Lỗi khi ghi nhận kết quả." });
    }
  }
}

export default new QuizController();
