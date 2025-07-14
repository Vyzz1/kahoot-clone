// hooks/useSaveQuiz.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosPrivate from "@/lib/axiosPrivate";
import type { Quiz } from "@/types/types";

export function useSaveQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quiz: Omit<Quiz, "_id">) => {
      // 1. Create quiz
      const { questions, ...quizData } = quiz;
      const res = await axiosPrivate.post("/quizzes", quizData);
      const createdQuiz = res.data;

      // 2. Create each question
      await Promise.all(
        questions.map((q) =>
          axiosPrivate.post("/questions", { ...q, quizId: createdQuiz._id })
        )
      );

      return createdQuiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/quizzes"] });
    },
  });
}
