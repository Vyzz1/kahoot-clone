import Question from "../models/question.model";
import Quiz from "../models/quiz.model";
import { PagedResult } from "../config/paged-result";
import { DocumentNotFoundError, ForbiddenError } from "../error/customError"; // Import ForbiddenError (still needed for delete, but not update permission)

interface GetAllQuestionsParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
  quizId?: string ;
  sortBy?: string; // Thêm sortBy
  sortOrder?: string; // Thêm sortOrder
}

const getAllQuestions = async ({
  page,
  pageSize,
  search = "",
  type,
  quizId,
  sortBy, // Lấy sortBy từ params
  sortOrder, // Lấy sortOrder từ params
}: GetAllQuestionsParams) => {
  const filter: Record<string, any> = {};
  if (search) filter.content = { $regex: search, $options: "i" };
  if (type) filter.type = type;
  if (quizId) filter.quiz = quizId;

  const sort: Record<string, any> = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1; // Ánh xạ 'asc'/'desc' sang 1/-1
  } else {
    sort.createdAt = -1; // Mặc định sắp xếp theo createdAt giảm dần
  }

  const total = await Question.countDocuments(filter);
  const data = await Question.find(filter)
    .skip(page * pageSize)
    .limit(pageSize)
    .sort(sort); // Áp dụng sắp xếp

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

// Đã loại bỏ kiểm tra quyền sở hữu để cho phép bất kỳ ai cũng có thể sửa câu hỏi
const updateQuestion = async (id: string, data: any, userId: string) => { // userId vẫn được truyền nhưng không dùng để kiểm tra quyền
  const question = await Question.findById(id);
  if (!question) {
    throw new DocumentNotFoundError("Question not found.");
  }

  const oldQuizId = question.quiz.toString();
  const newQuizId = data.quizId;

  // Nếu quizId được thay đổi, cập nhật liên kết giữa câu hỏi và quiz
  if (oldQuizId !== newQuizId) {
    // Kiểm tra xem quiz MỚI có tồn tại không
    const newParentQuiz = await Quiz.findById(newQuizId);
    if (!newParentQuiz) {
      throw new DocumentNotFoundError("Target Quiz not found."); // Lỗi nếu quiz mới không tồn tại
    }

    // Xóa câu hỏi khỏi mảng questions của quiz CŨ (nếu quiz cũ tồn tại)
    await Quiz.findByIdAndUpdate(oldQuizId, {
      $pull: { questions: question._id },
    });

    // Thêm câu hỏi vào mảng questions của quiz MỚI
    await Quiz.findByIdAndUpdate(newQuizId, {
      $push: { questions: question._id },
    });

    // Cập nhật trường quiz trong document câu hỏi
    question.quiz = newQuizId;
  }

  // Tách quizId ra khỏi data để tránh việc Object.assign cố gắng cập nhật lại trường quiz
  const { quizId, ...updateData } = data;

  // Cập nhật câu hỏi với dữ liệu còn lại
  Object.assign(question, updateData);
  await question.save();
  return question;
};

// Thêm userId để kiểm tra quyền sở hữu của quiz cha (giữ nguyên cho delete)
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
