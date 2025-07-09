import { Response } from "express";
import { TypedRequest } from "../types/express";
import { QuestionRequest } from "../schemas/question.schema";
import questionService from "../services/question.service";

class QuestionController {
  async createQuestion(req: TypedRequest<{ TBody: QuestionRequest }>, res: Response) {
    const question = await questionService.createQuestion(req.body);
    res.status(201).send(question);
  }

  async updateQuestion(req: TypedRequest<{ TParams: { id: string }; TBody: QuestionRequest }>, res: Response) {
    const question = await questionService.updateQuestion(req.params.id, req.body);
    res.send(question);
  }

  async deleteQuestion(req: TypedRequest<{ TParams: { id: string } }>, res: Response) {
    await questionService.deleteQuestion(req.params.id);
    res.status(204).send();
  }
}

export default new QuestionController();