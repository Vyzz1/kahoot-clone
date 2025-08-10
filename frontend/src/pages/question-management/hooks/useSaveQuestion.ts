import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Question } from "@/types/global";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export function useSaveQuestion() {
  const queryClient = useQueryClient();
  const axiosInstance = useAxiosPrivate({ type: "default" });

  return useMutation({
    mutationFn: async (question: Question) => {
      // Sửa đổi điều kiện isNew để bao gồm cả trường hợp _id không tồn tại
      const isNew = !question._id || (typeof question._id === "string" && question._id.startsWith("temp-"));

      if (isNew) {
        // Đối với câu hỏi mới (chưa có _id hoặc có _id tạm thời), gửi POST
        const {  ...newQuestionData } = question; // loại bỏ _id khi POST
        const res = await axiosInstance.post(`/questions`, newQuestionData);
        return res.data;
      } else {
        // Đối với câu hỏi đã tồn tại (có _id thật), gửi PUT
        const res = await axiosInstance.put(`/questions/${question._id}`, question);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/questions"] });
    },
  });
}
