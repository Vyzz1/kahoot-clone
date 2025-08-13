// file: useSaveQuiz.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export function useSaveQuiz() {
  const queryClient = useQueryClient();
  const axiosInstance = useAxiosPrivate({ type: "default" });

  return useMutation({
    mutationFn: async (quiz: Quiz) => {
      const { questions, ...quizDataToSend } = quiz;
      const res = await axiosInstance.post("/quizzes", quizDataToSend);
      const createdQuiz = res.data as Quiz;

      if (questions && questions.length > 0) {
        await Promise.all(
          questions.map((q) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id: _frontendQuestionId, ...questionData } = q;
            const questionPayload = {
              ...questionData,
            };
            return axiosInstance.post(
              `/quizzes/${createdQuiz._id}/questions`,
              questionPayload
            );
          })
        );
      }

      return createdQuiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/quizzes"] });
    },
  });
}