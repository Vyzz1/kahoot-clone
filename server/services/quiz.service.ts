import Quiz from "../models/quiz.model";
import Question from "../models/question.model";
import { QuizRequest } from "../schemas/quiz.schema";
import { QuestionRequest } from "../schemas/question.schema";
import { DocumentNotFoundError, ForbiddenError } from "../error/customError";
import { PagedResult } from "../config/paged-result";

class QuizService {
  async createQuiz(data: QuizRequest, userId: string) {
    return await Quiz.create({ ...data, user: userId });
  }

  async getQuizById(id: string) {
    const quiz = await Quiz.findById(id).populate("questions");
    if (!quiz) throw new DocumentNotFoundError("Quiz not found");
    return quiz;
  }

  async updateQuiz(id: string, data: QuizRequest, userId: string) {
    const quiz = await Quiz.findOne({ _id: id, user: userId });
    if (!quiz) {
      throw new DocumentNotFoundError("Quiz not found or you do not have permission to edit this quiz.");
    }
    Object.assign(quiz, data);
    await quiz.save();
    return quiz;
  }

  async deleteQuiz(id: string, userId: string) {
    const result = await Quiz.deleteOne({ _id: id, user: userId });
    if (result.deletedCount === 0) {
      throw new DocumentNotFoundError("Quiz not found or you do not have permission to delete this quiz.");
    }
    await Question.deleteMany({ quiz: id });
  }

  async getPublicQuizzes(
    search?: string,
    page = 0,
    pageSize = 10,
    tags?: string[],
    questionType?: string
  ): Promise<PagedResult<typeof Quiz.prototype>> {
    const query: any = { isPublic: true };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (questionType) {
      const matchingQuizIds = await Question.distinct("quiz", {
        type: questionType,
      });
      query._id = { $in: matchingQuizIds };
    }

    const total = await Quiz.countDocuments(query);
    const quizzes = await Quiz.find(query)
      .skip(page * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return new PagedResult(quizzes, total, page, pageSize);
  }

  async getQuizzesWithFilter(
  search?: string,
  page = 0,
  pageSize = 10,
  tags?: string[],
  questionType?: string,
  isPublic?: boolean
): Promise<PagedResult<typeof Quiz.prototype>> {
  const query: any = {};

  if (typeof isPublic === "boolean") {
    query.isPublic = isPublic;
  }

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  if (questionType) {
    const matchingQuizIds = await Question.distinct("quiz", {
      type: questionType,
    });
    query._id = { $in: matchingQuizIds };
  }

  const total = await Quiz.countDocuments(query);
  const quizzes = await Quiz.find(query)
    .skip(page * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  return new PagedResult(quizzes, total, page, pageSize);
}


  async getQuizzesByUser(
    userId: string,
    search?: string,
    page = 0,
    pageSize = 10,
    tags?: string[],
    questionType?: string
  ): Promise<PagedResult<typeof Quiz.prototype>> {
    const query: any = { user: userId };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (questionType) {
      const matchingQuizIds = await Question.distinct("quiz", {
        type: questionType,
      });
      query._id = { $in: matchingQuizIds };
    }

    const total = await Quiz.countDocuments(query);
    const quizzes = await Quiz.find(query)
      .skip(page * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return new PagedResult(quizzes, total, page, pageSize);
  }

  async getQuestionsByQuizId(quizId: string) {
  const questions = await Question.find({ quiz: quizId })
    .populate("quiz", "title")
    .sort({ order: 1 });
  return questions;
}

async addQuestionToQuiz(
    quizId: string,
    questionData: QuestionRequest,
    userId: string
  ) {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw new DocumentNotFoundError("Quiz not found.");
    }
    
    if (!quiz.user || quiz.user.toString() !== userId) {
      throw new ForbiddenError("You do not have permission to add questions to this quiz.");
    }

    const newQuestion = await Question.create({
      ...questionData,
      quiz: quizId,
      user: userId,
    });

    quiz.questions.push(newQuestion._id);
    await quiz.save();

    return newQuestion;
  }

}

export default new QuizService();