import Question from "../models/question.model";
import Quiz from "../models/quiz.model";
import { PagedResult } from "../utils/pagination";

interface GetAllQuestionsParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
}

const getAllQuestions = async ({
  page,
  pageSize,
  search = "",
  type,
}: GetAllQuestionsParams) => {
  const filter: Record<string, any> = {};
  if (search) filter.title = { $regex: search, $options: "i" };
  if (type) filter.type = type;

  const total = await Question.countDocuments(filter);
  const data = await Question.find(filter)
    .skip(page * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  return new PagedResult(data, total, page, pageSize);
};

const createQuestion = async (data: any) => {
  const question = await Question.create({ ...data, quiz: data.quizId });
  await Quiz.findByIdAndUpdate(data.quizId, {
    $push: { questions: question._id },
  });
  return question;
};

const updateQuestion = async (id: string, data: any) => {
  return await Question.findByIdAndUpdate(id, data, { new: true });
};

const deleteQuestion = async (id: string) => {
  const question = await Question.findByIdAndDelete(id);
  if (question) {
    await Quiz.findByIdAndUpdate(question.quiz, {
      $pull: { questions: question._id },
    });
  }
};

export default {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
};
