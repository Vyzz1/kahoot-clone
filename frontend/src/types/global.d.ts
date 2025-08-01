
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
export interface Pagination<T> {
  content: T[];
  data?: T[]; // Giữ lại data từ global.d.ts nếu có thể cần
  total: number; // Giữ lại total từ global.d.ts nếu có thể cần
  page?: number; // Giữ lại page từ global.d.ts nếu có thể cần
  pageSize: number;
  totalCount: number;
  currentPage: number;
  totalPages?: number;
  isFirst?: boolean;
  isLast?: boolean;
  isPrevious?: boolean;
  isNext?: boolean;
}

// Định nghĩa kiểu loại câu hỏi
export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "ordering" | "poll";

// Định nghĩa giao diện cho người dùng đã xác thực
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  // Thêm các thuộc tính khác nếu chúng là một phần của cấu trúc AuthenticatedUser của bạn
}

// Định nghĩa tùy chọn câu trả lời
export interface AnswerOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

// Định nghĩa phương tiện (ảnh/video)
export interface Media {
  image?: string;
  video?: string;
}

// Định nghĩa câu trả lời (từ types.ts)
export interface Answer {
  content: string;
  isCorrect?: boolean | null; // Có thể là boolean hoặc null nếu không xác định
}

// Định nghĩa giao diện Question (kết hợp từ cả hai file)
export interface Question {
  _id: string;
  type: QuestionType;
  title: string;
  content?: string; // Added this line to include the 'content' property
  answers: { text: string; isCorrect?: boolean }[];
  correctOrder?: string[];
  answerText?: string;
  image?: string;
  video?: string;
  timeLimit: number;
  quizId: string;
  createdAt: string;
  updatedAt: string;
  options: AnswerOption[];
  media?: Media;
  points?: number;
  correctAnswer: string;
  content?: string;
}

// Định nghĩa giao diện NewQuestion (kế thừa từ Question và loại bỏ _id, createdAt, updatedAt để sử dụng khi tạo mới)
// NewQuestion chỉ nên được sử dụng khi tạo mới một câu hỏi.
// Nếu bạn muốn một giao diện bao gồm tất cả các thuộc tính có thể có của một câu hỏi (bao gồm cả các trường chỉ có khi tạo mới),
// thì hãy sử dụng giao diện Question và làm cho các trường đó là tùy chọn.
// Dựa trên yêu cầu của bạn, tôi sẽ gộp nó vào Question và làm các trường đó tùy chọn nếu cần.

// Định nghĩa giao diện Quiz (kết hợp từ cả hai file)
export interface Quiz {
  _id: string; // Vẫn bắt buộc như yêu cầu trước đó của bạn
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


export interface QuizDetail extends Quiz {
  questions: Question[];
}

export interface Question {
  _id: string;
  content: string ;
  options: string[];
  correctAnswer: string;
}

export interface QuizResultPayload {
  answers: {
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeTaken: number;
  }[];
  totalTime: number;
  // score: number;
}

export interface QuizCreatePayload {
  title: string;
  description?: string;
  questions: {
    content: string;
    options: string[];
    correctAnswer: string;
  }[];
}