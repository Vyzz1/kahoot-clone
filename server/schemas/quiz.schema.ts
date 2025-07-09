import z from "zod";

export const quizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export type QuizRequest = z.infer<typeof quizSchema>;