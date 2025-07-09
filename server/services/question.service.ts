import Question from "../models/question.model";
import Quiz from "../models/quiz.model";

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
};
