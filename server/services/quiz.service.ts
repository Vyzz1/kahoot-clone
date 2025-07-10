import Quiz from "../models/quiz.model";
import Question from "../models/question.model";
import { QuizRequest } from "../schemas/quiz.schema";
import { DocumentNotFoundError } from "../error/customError";


class QuizService {
  async createQuiz(data: QuizRequest, userId: string) {
    return await Quiz.create({ ...data, user: userId });
  }

  async getQuizById(id: string) {
    const quiz = await Quiz.findById(id).populate("questions");
    if (!quiz) throw new DocumentNotFoundError("Quiz not found");
    return quiz;
  }

  async updateQuiz(id: string, data: QuizRequest) {
    const quiz = await Quiz.findByIdAndUpdate(id, data, { new: true });
    if (!quiz) throw new DocumentNotFoundError("Quiz not found");
    return quiz;
  }

  async deleteQuiz(id: string) {
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) throw new DocumentNotFoundError("Quiz not found");
    await Question.deleteMany({ quiz: id });
  }

  async getPublicQuizzes(
  search?: string,
  page = 0,
  pageSize = 10,
  tags?: string[],
  questionType?: string
) {
  const query: any = { isPublic: true };

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  // Truy vấn nâng cao: chỉ lấy quiz có ít nhất 1 câu hỏi loại mong muốn
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

  return {
    data: quizzes,
    total,
    currentPage: page,
    pageSize,
  };
}

async getQuizzesByUser(
  userId: string,
  search?: string,
  page = 0,
  pageSize = 10,
  tags?: string[],
  questionType?: string
) {
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

  return {
    data: quizzes,
    total,
    currentPage: page,
    pageSize,
  };
}

}

export default new QuizService();
