import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import type { Question } from "@/types/global";

export const useQuizQuestions = (quizId: string) => {
  const axiosPrivate = useAxiosPrivate({ type: "private" });

  return useQuery<Question[]>({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const res = await axiosPrivate.get(`/quizzes/${quizId}/questions`);
      return res.data;
    },
    enabled: !!quizId,
  });
};
