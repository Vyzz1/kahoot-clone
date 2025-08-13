// import axiosPrivate from "@/api/axios"; 
// import axiosPublic from "@/api/axiosPublic";
// // import type {
// //   Quiz,
// //   QuizDetail,
// //   QuizResultPayload,
// //   QuizCreatePayload,
// // } from "@/types/global";

// export const getPublicQuizzes = async (): Promise<Quiz[]> => {
//   const res = await axiosPublic.get("/quizzes/public/list");
//   return res.data;
// };

// export const getMyQuizzes = async (): Promise<Quiz[]> => {
//   const res = await axiosPrivate.get("/quizzes/my/list");
//   return res.data;
// };

// export const getQuizDetail = async (id: string): Promise<QuizDetail> => {
//   const res = await axiosPrivate.get(`/quizzes/${id}`);
//   return res.data;
// };

// export const getQuizQuestions = async (id: string): Promise<any[]> => {
//   const res = await axiosPublic.get(`/quizzes/${id}/questions`);
//   return res.data;
// };

// export const submitQuizResult = async (
//   id: string,
//   payload: QuizResultPayload
// ): Promise<any> => {
//   const res = await axiosPrivate.post(`/quizzes/${id}/submit`, payload);
//   return res.data;
// };

// export const createQuiz = async (
//   payload: QuizCreatePayload
// ): Promise<Quiz> => {
//   const res = await axiosPrivate.post("/quizzes", payload);
//   return res.data;
// };

// export const updateQuiz = async (
//   id: string,
//   payload: QuizCreatePayload
// ): Promise<Quiz> => {
//   const res = await axiosPrivate.put(`/quizzes/${id}`, payload);
//   return res.data;
// };

// export const deleteQuiz = async (id: string): Promise<void> => {
//   await axiosPrivate.delete(`/quizzes/${id}`);
// };
