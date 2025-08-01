// export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "ordering" | "poll";

// export interface AuthenticatedUser {
//   userId: string;
//   email: string;
//   role: string;
//   // Add other properties if they are part of your AuthenticatedUser structure
// }

// export interface NewQuestion {
//   _id: string;
//   type: QuestionType;
//   title?: string;
//   content?: string;
//   answers: { text: string; isCorrect?: boolean }[]; // used for multiple_choice & true_false
//   correctOrder?: string[]; // used for ordering
//   answerText?: string;     // used for short_answer
//   image?: string;
//   video?: string;
//   timeLimit: number;
//   quizId: string;
//   createdAt: string;
//   updatedAt: string;
//   options?: AnswerOption[];   
//   // Used for multiple_choice, true_false, poll
//   media?: Media; // Added: Object for image/video URLs
//   points?: number; // Added: Points for the question
// }

// export interface Quiz {
//   _id: string; // Still mandatory as per your previous request
//   title: string;
//   description: string;
//   isPublic: boolean;
//   createdAt: string;
//   updatedAt: string;
//   user: string;
//   questions: Question[]; 
//   quizTimeLimit?: number; // Overall time limit for the quiz

// }

// // export interface QuizWithQuestions extends Omit<Quiz, "_id" | "createdAt" | "_id" | "updatedAt" | "user"> {
// //   questions: Question[];
// // }

// export interface Pagination<T> {
//   content: T[];
//   totalCount: number;
//   currentPage: number;
//   pageSize: number;
//   totalPages: number;
//   isFirst: boolean;
//   isLast: boolean;
//   isPrevious: boolean;
//   isNext: boolean;
// }

// export interface AnswerOption {
//   text: string;
//   isCorrect?: boolean;
// }

// export interface Media {
//   image?: string;
//   video?: string;
// }
// export interface Answer {
//   text: string;
//   isCorrect?: boolean;
//   }

// export interface Question extends NewQuestion {
//   _id: string;
// }