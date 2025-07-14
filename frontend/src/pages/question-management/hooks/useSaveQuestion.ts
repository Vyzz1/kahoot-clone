// hooks/useSaveQuestion.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosPrivate from "@/lib/axiosPrivate"; // axios có attach token
import type { Question } from "@/types/types";

export function useSaveQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: Question) => {
      if (question._id.startsWith("temp-")) {
        // Thêm mới
        const res = await axiosPrivate.post("/questions", question);
        return res.data;
      } else {
        // Cập nhật
        const res = await axiosPrivate.put(`/questions/${question._id}`, question);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/questions"] });
    },
  });
}
