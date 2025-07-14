export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "ordering" | "poll";

export interface Question {
  _id: string;
  type: QuestionType;
  title: string;
  answers: { text: string; isCorrect?: boolean }[]; // dùng cho multiple_choice & true_false
  correctOrder?: string[]; // dùng cho ordering
  answerText?: string;     // dùng cho short_answer
  image?: string;
  video?: string;
  timeLimit: number;
  quizId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: string;
  questions: Question[]; 
}

// export interface QuizWithQuestions extends Omit<Quiz, "_id" | "createdAt" | "updatedAt" | "user"> {
//   questions: Question[];
// }

export interface Pagination<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
