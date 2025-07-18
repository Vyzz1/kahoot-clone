// hooks/useSaveQuiz.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Quiz } from "@/types/types"; // Import Quiz type
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export function useSaveQuiz() {
  const queryClient = useQueryClient();
  const axiosInstance = useAxiosPrivate({ type: "default" });

  return useMutation({

    mutationFn: async (quiz: Quiz) => {
      // 1. Tạo quiz:
      // Destructure questions và _id từ quiz.
      // Sử dụng underscore (_) để bỏ qua biến _id không dùng đến, loại bỏ cảnh báo ESLint.
      const { questions, _id, ...quizDataToSend } = quiz; 
      console.log("Payload to /quizzes:", quizDataToSend); // Log payload của quiz
      const res = await axiosInstance.post("/quizzes", quizDataToSend); // Gửi dữ liệu mà không có _id
      const createdQuiz = res.data as Quiz;
      console.log("Created Quiz from backend:", createdQuiz);

      // 2. Tạo từng câu hỏi:
      // Các câu hỏi từ frontend sẽ luôn có một _id (hoặc là uuidv4 tạm thời hoặc _id thực nếu là chỉnh sửa).
      // Endpoint POST /questions của backend được mong đợi sẽ tự tạo _id của riêng nó.
      // Vì vậy, chúng ta nên luôn loại bỏ _id của frontend khi gửi câu hỏi để tạo mới.
      await Promise.all(
        questions.map((q) => {
          // Destructure _id của frontend khỏi câu hỏi.
          // Sử dụng underscore (_) để bỏ qua biến frontendQuestionId không dùng đến, loại bỏ cảnh báo ESLint.
          const { _id: _frontendQuestionId, ...restOfQuestionData } = q; 
          const questionPayload = {
            ...restOfQuestionData, // Chứa content, type, timeLimit, v.v.
            quizId: createdQuiz._id, // Sử dụng _id được backend tạo cho quiz
            options: q.answers, // Ánh xạ 'answers' của frontend sang 'options' của backend
          };
          console.log("Payload to /questions for question:", questionPayload);
          return axiosInstance.post("/questions", questionPayload);
        })
      );

      return createdQuiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/quizzes"] });
    },
  });
}
