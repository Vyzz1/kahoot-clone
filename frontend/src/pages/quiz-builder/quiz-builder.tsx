import { useState } from "react";
import QuizForm from "./quiz-form";
import QuestionForm from "./question-form";
import QuestionList from "./question-list";
import { Button, Divider, message } from "antd";
import type { Quiz, Question } from "../../types/types";
import axios from "@/api/axios";
import { v4 as uuidv4 } from "uuid";

export default function QuizBuilder() {
  const [quizInfo, setQuizInfo] = useState<Quiz>({
     _id: uuidv4(),
    title: "",
    isPublic: false,
    description: "",
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: "",
  });

  const [quizId, setQuizId] = useState<string>(""); // lưu quizId để gán cho question
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const addOrUpdateQuestion = (question: Question) => {
    const questionWithQuizId: Question = {
      ...question,
      quizId: quizId || "temp-id", // dùng tạm nếu quizId chưa có
    };

    setQuizInfo((prev) => {
      const exists = prev.questions.find((q) => q._id === question._id);
      const updated = exists
        ? prev.questions.map((q) => (q._id === question._id ? questionWithQuizId : q))
        : [...prev.questions, questionWithQuizId];
      return { ...prev, questions: updated };
    });

    setEditingQuestion(null);
  };

  const deleteQuestion = (id: string) => {
    setQuizInfo((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q._id !== id),
    }));
  };

  const saveQuiz = async () => {
    try {
      // Tạo quiz trước, không bao gồm questions
      const { title, description, isPublic } = quizInfo;
      const quizPayload = { title, description, isPublic };

      const res = await axios.post("/quizzes", quizPayload);
      const createdQuiz = res.data;
      setQuizId(createdQuiz._id);

      // Sau khi quiz được tạo, tạo các câu hỏi
      const questionPromises = quizInfo.questions.map((q) => {
        return axios.post("/questions", { ...q, quizId: createdQuiz._id });
      });

      await Promise.all(questionPromises);
      message.success("Quiz and questions saved successfully");
    } catch (err: any) {
      console.error("Failed to save:", err.response?.data?.message);
      message.error(err.response?.data?.message || "Failed to save quiz");
    }
  };

  return (
    <section className="max-w-5xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-semibold">Create New Quiz</h2>

      <QuizForm quiz={quizInfo} setQuiz={setQuizInfo} />

      <Divider />

      <QuestionForm
        quizId={quizId || "temp-id"} // gán quizId tạm nếu chưa có
        onAdd={addOrUpdateQuestion}
        editingQuestion={editingQuestion}
        key={editingQuestion?._id || "new"}
      />

      <Divider />

      <QuestionList
        questions={quizInfo.questions}
        onEdit={(q) => setEditingQuestion(q)}
        onDelete={deleteQuestion}
      />

      <Button type="primary" block onClick={saveQuiz}>
        Save Quiz
      </Button>
    </section>
  );
}
