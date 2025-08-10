// src/schemas/question.schema.ts
import z from "zod";

// Enum cho các loại câu hỏi
const questionTypeEnum = z.enum([
  "multiple_choice",
  "true_false",
  "ordering",
  "short_answer",
  "poll",
]);

// Schema câu hỏi
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

    // Các loại câu trả lời khác nhau theo loại câu hỏi
    options: z
      .array(z.object({ text: z.string(), isCorrect: z.boolean().optional() }))
      .optional(),

    correctOrder: z.array(z.string()).optional(),

    answerText: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Ràng buộc options: ít nhất 2 options cho multiple_choice, true_false, poll
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

    // Ràng buộc cho multiple_choice: phải có ít nhất một đáp án đúng
    if (data.type === "multiple_choice") {
      if (!data.options || !data.options.some(option => option.isCorrect)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one correct answer is required for multiple choice questions",
          path: ["options"], // Hoặc một path cụ thể hơn nếu bạn muốn
        });
      }
    }

    // Ràng buộc answerText: bắt buộc cho short_answer
    if (data.type === "short_answer" && !data.answerText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Answer text is required for short answer questions",
        path: ["answerText"],
      });
    }

    // Ràng buộc correctOrder: bắt buộc và ít nhất 2 phần tử cho ordering
    if (data.type === "ordering" && (!data.correctOrder || data.correctOrder.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Correct order is required for ordering questions",
        path: ["correctOrder"],
      });
    }
  });

// Export kiểu dữ liệu
export type QuestionRequest = z.infer<typeof questionSchema>;
