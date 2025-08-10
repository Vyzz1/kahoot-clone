// Định nghĩa các kiểu chung
declare type CurrentUserType = {
  photoUrl: string;
  name: string;
  id: number;
  role: string;

  fullName: string;
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

// Định nghĩa kiểu cho phân trang
interface Pagination<T> {
  content: T[];
  total: number;
  page: number;
  pageSize: number;
  totalCount: number;
  currentPage: number;
}

declare type Quiz = {
  _id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: string;
};

declare interface Pagination<T> {
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

declare type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "ordering"
  | "poll";

interface QuestionOption {
  _id: string;
  text: string;
  isCorrect?: boolean;
}

declare interface Question {
  _id: string;
  content: string;
  type: "multiple_choice" | "true_false" | "ordering" | "short_answer" | "poll";
  timeLimit: number;
  options?: QuestionOption[];
  correctOrder?: string[];
  answerText?: string;
  media?: {
    image?: string;
    video?: string;
  };
  points: number;
}
declare interface Quiz {
  _id: string;
  title: string;
  description?: string; // Từ global.d.ts nó là tùy chọn, từ types.ts nó là bắt buộc. Giữ là tùy chọn để linh hoạt.
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: string;
  questions: Question[]; // Thêm từ global.d.ts và types.ts
  quizTimeLimit?: number; // Giới hạn thời gian tổng thể cho bài kiểm tra, từ types.ts
}

// export interface Question {
//   _id: string;
//   title: string;
//   options: {
//     id: string;
//     content: string;
//   }[];
//   correctAnswer: string;
//   content: string;
// }

declare interface QuizDetail extends Quiz {
  questions: Question[];
}

declare interface Player {
  id: string;
  displayName: string;
  score: number;
  avatar: string;
  answers: Array<{
    questionIndex: number;
    answerId: string;
    answerTime: number;
    isCorrect: boolean;
    pointsEarned: number;
    answerData: any;
  }>;
}

declare type CorrectAnswer =
  | string
  | string[]
  | { text: string; _id: any }[]
  | undefined;

declare interface GameState {
  players: Player[];
  currentQuestionIndex: number;
  currentQuestion: string;
  questionEndTime?: Date;
  isCurrentQuestionEnded: boolean;
  startedAt: Date;
  finishedAt?: Date;
  status: "waiting" | "in_progress" | "finished" | "waiting_for_next_question";
  hostId: string;
  quizId: string;
  totalQuestions: number;
}

declare interface IBaseGame {
  _id: string;
  status: "waiting" | "in_progress" | "finished";
  pin: string;
  questionStartTime?: Date;
  startedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

declare interface GameHosted extends IBaseGame {
  quiz: {
    title: string;
    description: string;
  };
  players: Array<{
    fullName: string;
    avatar: string;
    email: string;
  }>;
}

declare type PaginationGameHosted = Pagination<GameHosted>;

declare type GamePlayed = Omit<GameHosted, "updatedAt"> & {
  quiz: {
    title: string;
    description: string;
  };
  host: Array<{
    fullName: string;
    avatar: string;
    email: string;
  }>;
};

declare type PaginationGamePlayed = Pagination<GamePlayed>;

declare interface GameSessionResponse {
  gameSession: {
    _id: string;
    game: {
      title: string;
      pin: string;
      status: "waiting" | "in_progress" | "finished";
      startedAt: string;
      finishedAt?: string;
      quiz: {
        title: string;
        description: string;
      };
    };
    player: {
      _id: string;
      fullName: string;
      avatar: string;
      email: string;
    };
    displayName: string;
    totalScore: number;
    correctAnswers: number;
    totalAnswered: number;
    averageResponseTime: number;
    finalRank?: number;
    joinedAt: string;
    finishedAt?: string;
    status: "active" | "disconnected" | "finished";
    maxStreak: number;
    currentStreak: number;
  };
  answers: Array<{
    _id: string;
    game: string;
    question: {
      _id: string;
      content: string;
      type: QuestionType;
      points: number;
      timeLimit: number;
      options?: Array<{
        _id: string;
        text: string;
      }>;
    };
    player: string;
    answer: {
      selectedOptionIndex?: number;
      booleanAnswer?: boolean;
      textAnswer?: string;
      orderAnswer?: string[];
      pollAnswer?: string;
    };
    responseTime: number;
    pointsEarned: number;
    isCorrect: boolean;
    submittedAt: string;
  }>;
  leaderboard: Array<{
    _id: string;
    player: {
      _id: string;
      fullName: string;
      avatar: string;
    };
    displayName: string;
    totalScore: number;
    finalRank?: number;
    correctAnswers: number;
    totalAnswered: number;
  }>;
  statistics: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageResponseTime: number;
    maxStreak: number;
    currentStreak: number;
    totalPoints: number;
    rank: number;
  };
}
