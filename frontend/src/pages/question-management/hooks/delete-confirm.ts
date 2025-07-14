import axiosPrivate from "@/api/axios";

export default async function deleteQuestionById(id: string) {
  await axiosPrivate.delete(`/questions/${id}`);
}