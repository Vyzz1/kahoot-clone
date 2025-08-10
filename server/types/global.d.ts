declare interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}
declare namespace Express {
  interface Request {
    user?: AuthenticatedUser;
  }
}
interface CommonLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    email: string;
    role: string;
    fullName: string;
    avatar?: string | null;
  };
}

// Answer types
interface AnswerData {
  selectedOptionIndex?: number;
  booleanAnswer?: boolean;
  textAnswer?: string;
  orderAnswer?: string[];
  pollAnswer?: string;
}

interface Player {
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
  }>;
}

interface GameMap {
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
  totalQuestions?: number;
}
