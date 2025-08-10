import { QuestionDocument } from "../models/question.model";

export const mapQuestionToNoAns = (question: QuestionDocument): any => {
  return {
    content: question?.content,
    timeLimit: question?.timeLimit,
    type: question?.type,
    points: question?.points,
    options: question?.options.map((opt) => ({
      text: opt.text,
      _id: opt._id,
    })),
  };
};

export const getCorrectAnswer = (
  questionMap: Map<string, QuestionDocument[]>,
  gameId: string,
  questionIndex: number
): string | string[] | { text: string; _id: any }[] | undefined => {
  const question = questionMap.get(gameId)?.[questionIndex];
  if (!question) {
    throw new Error(`Question with ID ${gameId} does not exist.`);
  }

  let result;
  switch (question.type) {
    case "multiple_choice":
    case "true_false":
      result = question.options.find((opt) => opt.isCorrect === true);
      return result?.text!;
    case "ordering":
      result = question.correctOrder;
      return result;
    case "short_answer":
      return question.answerText!;
    case "poll":
      return question.options.map((opt) => ({
        text: opt.text,
        _id: opt._id,
      })) as any;
    default:
      throw new Error(`Unsupported question type: ${question.type}`);
  }
};
