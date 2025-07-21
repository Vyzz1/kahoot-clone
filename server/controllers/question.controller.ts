import { Response } from "express";
import { TypedRequest } from "../types/express";
import { QuestionRequest } from "../schemas/question.schema";
import questionService from "../services/question.service";

class QuestionController {
  
async getAllQuestions(
  req: TypedRequest<{
    TQuery: {
      page?: string;
      pageSize?: string;
      search?: string;
      type?: string;
      quizId?: string;
      sortBy?: string; // Thêm sortBy
      sortOrder?: string; // Thêm sortOrder
    };
  }>,
  res: Response
) {
  const {
    page = "0",
    pageSize = "10",
    search = "",
    type,
    sortBy, // Lấy sortBy từ query
    sortOrder, // Lấy sortOrder từ query
  } = req.query;

  const result = await questionService.getAllQuestions({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    search,
    type,
    quizId: req.query.quizId,
    sortBy, // Truyền sortBy vào service
    sortOrder, // Truyền sortOrder vào service
  });

  res.send(result.response);
}

  async createQuestion(req: TypedRequest<{ TBody: QuestionRequest }>, res: Response) {
    const question = await questionService.createQuestion(req.body);
    res.status(201).send(question);
  }

  async updateQuestion(req: TypedRequest<{ TParams: { id: string }; TBody: QuestionRequest }>, res: Response) {
    // Truyền req.user!.userId vào phương thức updateQuestion
    const question = await questionService.updateQuestion(req.params.id, req.body, req.user!.userId);
    res.send(question);
  }

  async deleteQuestion(req: TypedRequest<{ TParams: { id: string } }>, res: Response) {
    // Truyền req.user!.userId vào phương thức deleteQuestion
    await questionService.deleteQuestion(req.params.id, req.user!.userId);
    res.status(204).send();
  }
  
}

export default new QuestionController();

