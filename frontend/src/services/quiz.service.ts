// src/services/quiz.service.ts
import axiosPrivate from "@/api/axios"; // Axios đã có token
import axiosPublic from "@/api/axiosPublic"; // Axios không cần token
import type {
  Quiz,
  QuizDetail,
  QuizResultPayload,
  QuizCreatePayload,
} from "@/types/global";

// Lấy danh sách quiz công khai
export const getPublicQuizzes = async (): Promise<Quiz[]> => {
  const res = await axiosPublic.get("/quizzes/public/list");
  return res.data;
};

// Lấy danh sách quiz của người dùng hiện tại
export const getMyQuizzes = async (): Promise<Quiz[]> => {
  const res = await axiosPrivate.get("/quizzes/my/list");
  return res.data;
};

// Lấy chi tiết quiz
export const getQuizDetail = async (id: string): Promise<QuizDetail> => {
  const res = await axiosPrivate.get(`/quizzes/${id}`);
  return res.data;
};

// Lấy danh sách câu hỏi của quiz
export const getQuizQuestions = async (id: string): Promise<any[]> => {
  const res = await axiosPublic.get(`/quizzes/${id}/questions`);
  return res.data;
};

// Gửi kết quả làm quiz
export const submitQuizResult = async (
  id: string,
  payload: QuizResultPayload
): Promise<any> => {
  const res = await axiosPrivate.post(`/quizzes/${id}/submit`, payload);
  return res.data;
};

// Tạo mới quiz
export const createQuiz = async (
  payload: QuizCreatePayload
): Promise<Quiz> => {
  const res = await axiosPrivate.post("/quizzes", payload);
  return res.data;
};

// Cập nhật quiz
export const updateQuiz = async (
  id: string,
  payload: QuizCreatePayload
): Promise<Quiz> => {
  const res = await axiosPrivate.put(`/quizzes/${id}`, payload);
  return res.data;
};

// Xoá quiz
export const deleteQuiz = async (id: string): Promise<void> => {
  await axiosPrivate.delete(`/quizzes/${id}`);
};
