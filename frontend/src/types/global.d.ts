declare type CurrentUserType = {
  photoUrl: string;
  name: string;
  id: number;
  role: string;
  email: string;
};

declare type User = {
  _id: number;
  fullName: string;
  email: string;
  role: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  isBanned: boolean;
  provider: string;
  providerId: string;
};

declare type Pagination<T> = {
  content: T[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalCount: number;
  currentPage: number;
};

declare type Quiz = {
  _id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: string;
};

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

export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "ordering" | "poll";

export interface Question {
  _id: string;
  type: QuestionType;
  title: string;
  // content: string;
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



