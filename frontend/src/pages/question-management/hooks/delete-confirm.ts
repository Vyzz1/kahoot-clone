import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  const axiosInstance = useAxiosPrivate({ type: "default" });

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/questions"] });
    },
  });
}