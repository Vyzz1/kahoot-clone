// hooks/useSaveQuiz.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Quiz } from "@/types/types";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export function useSaveQuiz() {
  const queryClient = useQueryClient();
  const axiosInstance = useAxiosPrivate({ type: "default" });

  return useMutation({
    mutationFn: async (quiz: Omit<Quiz, "_id">) => {
      // 1. Create quiz
      const { questions, ...quizData } = quiz;
      const res = await axiosInstance.post("/quizzes", quizData);
      const createdQuiz = res.data;

      // 2. Create each question
      await Promise.all(
        questions.map((q) =>
          axiosInstance.post("/questions", { ...q, quizId: createdQuiz._id })
        )
      );

      return createdQuiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/quizzes"] });
    },
  });
}
