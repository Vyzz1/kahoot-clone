import z from "zod";

const questionTypeEnum = z.enum([
  "multiple_choice",
  "true_false",
  "ordering",
  "short_answer",
  "poll",
]);

export const questionSchema = z
  .object({
    quizId: z.string(),
    type: questionTypeEnum,
    content: z.string().min(1, "Content is required"),
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
  })
  .superRefine((data, ctx) => {

    if (
      ["multiple_choice", "true_false", "poll"].includes(data.type) &&
      (!data.options || data.options.length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least 2 options are required",
        path: ["options"],
      });
    }

    if (data.type === "multiple_choice") {
      if (!data.options || !data.options.some(option => option.isCorrect)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one correct answer is required for multiple choice questions",
          path: ["options"], 
        });
      }
    }
    if (data.type === "short_answer" && !data.answerText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Answer text is required for short answer questions",
        path: ["answerText"],
      });
    }

    if (data.type === "ordering" && (!data.correctOrder || data.correctOrder.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Correct order is required for ordering questions",
        path: ["correctOrder"],
      });
    }
  });

export type QuestionRequest = z.infer<typeof questionSchema>;
