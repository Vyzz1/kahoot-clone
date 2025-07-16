export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "ordering" | "poll";

export interface NewQuestion {
  _id: string;
  type: QuestionType;
  title?: string;
  content?: string;
  answers: { text: string; isCorrect?: boolean }[]; // dùng cho multiple_choice & true_false
  correctOrder?: string[]; // dùng cho ordering
  answerText?: string;     // dùng cho short_answer
  image?: string;
  video?: string;
  timeLimit: number;
  quizId: string;
  createdAt: string;
  updatedAt: string;
  options?: AnswerOption[];   
  // Dùng cho multiple_choice, true_false, poll
  media?: Media; // Dùng cho image, video
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
  content: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  isPrevious: boolean;
  isNext: boolean;
}

export interface AnswerOption {
  text: string;
  isCorrect?: boolean;
}

export interface Media {
  image?: string;
  video?: string;
}
export interface Answer {
  text: string;
  isCorrect?: boolean;
}

export interface Question extends NewQuestion {
  _id: string;
}