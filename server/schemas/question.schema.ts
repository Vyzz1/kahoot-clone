import z from "zod";

export const questionSchema = z.object({
  quizId: z.string(),
  type: z.enum(["multiple_choice", "true_false", "ordering", "short_answer", "poll"]),
  content: z.string().min(1),
  media: z
    .object({
      image: z.string().url().optional(),
      video: z.string().url().optional(),
    })
    .optional(),
  timeLimit: z.number().min(5).max(300).optional(),
  options: z
    .array(z.object({ text: z.string(), isCorrect: z.boolean().optional() }))
    .optional(),
  correctOrder: z.array(z.string()).optional(),
  answerText: z.string().optional(),
});

export type QuestionRequest = z.infer<typeof questionSchema>;