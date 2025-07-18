import Question from "../models/question.model";
import Quiz from "../models/quiz.model";
import { PagedResult } from "../config/paged-result";
import { DocumentNotFoundError, ForbiddenError } from "../error/customError"; // Import ForbiddenError

interface GetAllQuestionsParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
  quizId?: string ;
}

const getAllQuestions = async ({
  page,
  pageSize,
  search = "",
  type,
  quizId,
}: GetAllQuestionsParams) => {
  const filter: Record<string, any> = {};
  if (search) filter.content = { $regex: search, $options: "i" };
  if (type) filter.type = type;
  if (quizId) filter.quiz = quizId;

  const total = await Question.countDocuments(filter);
  const data = await Question.find(filter)
    .skip(page * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  return new PagedResult(data, total, page, pageSize);
};

const createQuestion = async (data: any) => {
  const { quizId, ...rest } = data;
  // Kiểm tra xem quiz có tồn tại không trước khi tạo câu hỏi
  const existingQuiz = await Quiz.findById(quizId);
  if (!existingQuiz) {
    throw new DocumentNotFoundError("Quiz not found for this question.");
  }

  const question = await Question.create({ ...rest, quiz: quizId });
  await Quiz.findByIdAndUpdate(quizId, {
    $push: { questions: question._id },
  });
  return question;
};

// Thêm userId để kiểm tra quyền sở hữu của quiz cha
const updateQuestion = async (id: string, data: any, userId: string) => {
  const question = await Question.findById(id);
  if (!question) {
    throw new DocumentNotFoundError("Question not found.");
  }

  // Kiểm tra quyền sở hữu của quiz cha
  const parentQuiz = await Quiz.findOne({ _id: question.quiz, user: userId });
  if (!parentQuiz) {
    throw new ForbiddenError("You do not have permission to edit questions in this quiz.");
  }

  // Cập nhật câu hỏi
  Object.assign(question, data);
  await question.save();
  return question;
};

// Thêm userId để kiểm tra quyền sở hữu của quiz cha
const deleteQuestion = async (id: string, userId: string) => {
  const question = await Question.findById(id);
  if (!question) {
    throw new DocumentNotFoundError("Question not found.");
  }

  // Kiểm tra quyền sở hữu của quiz cha
  const parentQuiz = await Quiz.findOne({ _id: question.quiz, user: userId });
  if (!parentQuiz) {
    throw new ForbiddenError("You do not have permission to delete questions from this quiz.");
  }

  // Xóa câu hỏi
  const deletedQuestion = await Question.findByIdAndDelete(id);
  if (deletedQuestion) {
    await Quiz.findByIdAndUpdate(deletedQuestion.quiz, {
      $pull: { questions: deletedQuestion._id },
    });
  }
};

export default {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
};
