import Quiz from "../models/quiz.model";
import Question from "../models/question.model";
import { QuizRequest } from "../schemas/quiz.schema";
import { DocumentNotFoundError, ForbiddenError } from "../error/customError"; // Import ForbiddenError
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

  async updateQuiz(id: string, data: QuizRequest, userId: string) { // Thêm userId
    // Tìm kiếm quiz bằng cả ID và userId để đảm bảo quyền sở hữu
    const quiz = await Quiz.findOne({ _id: id, user: userId }); 
    if (!quiz) {
      // Nếu không tìm thấy quiz hoặc người dùng không phải chủ sở hữu
      throw new DocumentNotFoundError("Quiz not found or you do not have permission to edit this quiz.");
    }
    
    // Cập nhật các trường dữ liệu
    Object.assign(quiz, data);
    await quiz.save(); // Sử dụng save() thay vì findByIdAndUpdate để kích hoạt middleware (nếu có) và validation
    return quiz;
  }

  async deleteQuiz(id: string, userId: string) { // Thêm userId
    // Tìm và xóa quiz bằng cả ID và userId
    const result = await Quiz.deleteOne({ _id: id, user: userId });
    if (result.deletedCount === 0) {
      // Nếu không có quiz nào được xóa, có nghĩa là không tìm thấy hoặc không có quyền
      throw new DocumentNotFoundError("Quiz not found or you do not have permission to delete this quiz.");
    }
    // Xóa tất cả câu hỏi liên quan đến quiz này
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
}

export default new QuizService();
