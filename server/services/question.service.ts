import Question from "../models/question.model";
import Quiz from "../models/quiz.model";
import { PagedResult } from "../config/paged-result";
import { DocumentNotFoundError, ForbiddenError } from "../error/customError";

interface GetAllQuestionsParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
  quizId?: string ;
  sortBy?: string;
  sortOrder?: string;
}

const getAllQuestions = async ({
  page,
  pageSize,
  search = "",
  type,
  quizId,
  sortBy,
  sortOrder,
}: GetAllQuestionsParams) => {
  const filter: Record<string, any> = {};
  if (search) filter.content = { $regex: search, $options: "i" };
  if (type) filter.type = type;
  if (quizId) filter.quiz = quizId;

  const sort: Record<string, any> = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const total = await Question.countDocuments(filter);
  const data = await Question.find(filter)
    .skip(page * pageSize)
    .limit(pageSize)
    .sort(sort);

  // LOG THIS TO CONFIRM THE PAGE VALUE BEFORE PagedResult
  console.log('Backend Service - Page value before PagedResult:', page);

  return new PagedResult(data, total, page, pageSize);
};

const createQuestion = async (data: any) => {
  const { quizId, ...rest } = data;
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

const updateQuestion = async (id: string, data: any, userId: string) => {
  const question = await Question.findById(id);
  if (!question) {
    throw new DocumentNotFoundError("Question not found.");
  }

  const oldQuizId = question.quiz.toString();
  const newQuizId = data.quizId;

  if (oldQuizId !== newQuizId) {
    const newParentQuiz = await Quiz.findById(newQuizId);
    if (!newParentQuiz) {
      throw new DocumentNotFoundError("Target Quiz not found.");
    }

    await Quiz.findByIdAndUpdate(oldQuizId, {
      $pull: { questions: question._id },
    });

    await Quiz.findByIdAndUpdate(newQuizId, {
      $push: { questions: question._id },
    });

    question.quiz = newQuizId;
  }

  const { quizId, ...updateData } = data;
  Object.assign(question, updateData);
  await question.save();
  return question;
};

const deleteQuestion = async (id: string, userId: string) => {
  const question = await Question.findById(id);
  if (!question) {
    throw new DocumentNotFoundError("Question not found.");
  }

  const parentQuiz = await Quiz.findOne({ _id: question.quiz, user: userId });
  if (!parentQuiz) {
    throw new ForbiddenError("You do not have permission to delete questions from this quiz.");
  }

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
