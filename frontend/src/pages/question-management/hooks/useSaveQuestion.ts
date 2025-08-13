import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export function useSaveQuestion() {
  const queryClient = useQueryClient();
  const axiosInstance = useAxiosPrivate({ type: "default" });

  return useMutation({
    mutationFn: async (question: Question) => {
      const isNew = !question._id || (typeof question._id === "string" && question._id.startsWith("temp-"));

      if (isNew) {
        const {  ...newQuestionData } = question;
        const res = await axiosInstance.post(`/questions`, newQuestionData);
        return res.data;
      } else {
        const res = await axiosInstance.put(`/questions/${question._id}`, question);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/questions"] });
    },
  });
}
