import { z } from "zod";

// Schema cho answer data dựa trên loại câu hỏi
export const answerDataSchema = z.object({
  selectedOptionIndex: z.number().optional(),
  booleanAnswer: z.boolean().optional(),
  textAnswer: z.string().optional(),
  orderAnswer: z.array(z.string()).optional(),
  pollAnswer: z.string().optional(),
});

// Schema cho việc submit answer
export const submitAnswerSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
  answer: answerDataSchema,
  responseTime: z.number().min(0, "Response time must be non-negative"),
});

// Schema cho việc get answers by game
export const getAnswersByGameSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  questionId: z.string().optional(),
  playerId: z.string().optional(),
});

// Schema cho game session
export const gameSessionSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  playerId: z.string().min(1, "Player ID is required"),
  displayName: z.string().min(1, "Display name is required"),
});

// Schema cho việc update game session
export const updateGameSessionSchema = z.object({
  totalScore: z.number().optional(),
  correctAnswers: z.number().optional(),
  totalAnswered: z.number().optional(),
  averageResponseTime: z.number().optional(),
  finalRank: z.number().optional(),
  status: z.enum(["active", "disconnected", "finished"]).optional(),
  maxStreak: z.number().optional(),
  currentStreak: z.number().optional(),
});

export type SubmitAnswerBody = z.infer<typeof submitAnswerSchema>;
export type GetAnswersByGameQuery = z.infer<typeof getAnswersByGameSchema>;
export type GameSessionBody = z.infer<typeof gameSessionSchema>;
export type UpdateGameSessionBody = z.infer<typeof updateGameSessionSchema>;
