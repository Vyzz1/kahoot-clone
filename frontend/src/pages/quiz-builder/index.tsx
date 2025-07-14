import { useState } from "react";
import { Button, Divider, message, Flex } from "antd";
import { useNavigate } from "react-router-dom";
import QuizForm from "./quiz-form";
import QuestionForm from "./question-form";
import QuestionList from "./question-list";
import type { Quiz, Question } from "@/types/types";
import { useSaveQuiz } from "@/pages/quiz-builder/hooks/useSaveQuiz";
import { v4 as uuidv4 } from 'uuid';

export default function QuizBuilder() {
  const navigate = useNavigate();
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

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const { mutate: saveQuiz, isPending } = useSaveQuiz();

  const addOrUpdateQuestion = (question: Question) => {
    setQuizInfo((prev) => {
      const exists = prev.questions.find((q) => q._id === question._id);
      const updated = exists
        ? prev.questions.map((q) => (q._id === question._id ? question : q))
        : [...prev.questions, question];
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

  const handleSave = () => {
    if (!quizInfo.title.trim()) {
      message.warning("Quiz title is required");
      return;
    }

    saveQuiz(quizInfo, {
      onSuccess: () => {
        message.success("Quiz saved successfully");
        navigate("/admin/quiz-management");
      },
      onError: (err: any) => {
        message.error(err.response?.data?.message || "Failed to save quiz");
      },
    });
  };

  return (
    <section className="max-w-5xl mx-auto p-4 space-y-6">
      <Flex justify="space-between" align="center">
        <h2 className="text-2xl font-semibold">🎨 Create New Quiz</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/admin/question-management")}>
            Question Management
          </Button>
          <Button onClick={() => navigate("/admin/quiz-management")}>
            Back to Quiz List
          </Button>
        </div>
      </Flex>

      <QuizForm quiz={quizInfo} setQuiz={setQuizInfo} />
      <Divider />

      <QuestionForm
        quizId="temp-id"
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

      <Button
        type="primary"
        block
        onClick={handleSave}
        loading={isPending}
        disabled={quizInfo.questions.length === 0}
      >
        {isPending ? "Saving..." : "Save Quiz"}
      </Button>
    </section>
  );
}
