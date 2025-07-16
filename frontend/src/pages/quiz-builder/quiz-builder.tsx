import { useState } from "react";
import QuizForm from "./quiz-form";
import QuestionForm from "./question-form";
import QuestionList from "./question-list";
import { Button, Divider, message, Flex, Typography } from "antd"; // Import Typography and Flex
import { useNavigate } from "react-router-dom";
import type { Quiz, Question } from "@/types/types"; // Ensure correct path for types
import { useSaveQuiz } from "@/pages/quiz-builder/hooks/useSaveQuiz"; // Assuming this path is correct
import { v4 as uuidv4 } from "uuid"; // For generating temporary IDs

const { Title } = Typography;

export default function QuizBuilder() {
  const navigate = useNavigate();
  const [quizInfo, setQuizInfo] = useState<Quiz>({
    _id: uuidv4(), // Initialize with a UUID for new quizzes
    title: "",
    isPublic: false,
    description: "",
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: "", // Assuming 'user' is handled elsewhere or can be empty
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Use the useSaveQuiz hook for saving logic
  const { mutate: saveQuiz, isPending } = useSaveQuiz();

  const addOrUpdateQuestion = (question: Question) => {
    setQuizInfo((prev) => {
      const exists = prev.questions.find((q) => q._id === question._id);
      const updated = exists
        ? prev.questions.map((q) => (q._id === question._id ? question : q))
        : [...prev.questions, question];
      return { ...prev, questions: updated };
    });
    setEditingQuestion(null); // Clear editing state after add/update
  };

  const deleteQuestion = (id: string) => {
    setQuizInfo((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q._id !== id),
    }));
  };

  const handleSaveQuiz = () => {
    if (!quizInfo.title.trim()) {
      message.error("Quiz title cannot be empty!");
      return;
    }
    if (quizInfo.questions.length === 0) {
      message.warning("Please add at least one question to the quiz.");
      return;
    }

    // Call the mutate function from useSaveQuiz hook
    saveQuiz(quizInfo, {
      onSuccess: () => {
        message.success("Quiz saved successfully!");
        navigate("/admin/quiz-management"); // Redirect after successful save
      },
      onError: (err: any) => {
        message.error(err.response?.data?.message || "Failed to save quiz.");
      },
    });
  };

  return (
    <section className="max-w-5xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen rounded-xl shadow-lg">
      {/* Header Section */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <Title level={3} className="m-0 text-gray-800">
          🎨 Create New Quiz
        </Title>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => navigate("/admin/question-management")}
            className="rounded-md shadow-sm hover:shadow-md transition-all"
          >
            Question Management
          </Button>
          <Button
            onClick={() => navigate("/admin/quiz-management")}
            className="rounded-md shadow-sm hover:shadow-md transition-all"
          >
            Back to Quiz List
          </Button>
        </div>
      </Flex>

      {/* Quiz Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <QuizForm quiz={quizInfo} setQuiz={setQuizInfo} />
      </div>

      <Divider className="my-6" />

      {/* Question Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <Title level={4} className="mb-4 text-gray-700">Add/Edit Question</Title>
        <QuestionForm
          quizId={quizInfo._id} // Pass quizInfo._id directly
          onAdd={addOrUpdateQuestion}
          editingQuestion={editingQuestion}
          key={editingQuestion?._id || "new"} // Key helps re-mount form when editingQuestion changes
        />
      </div>

      <Divider className="my-6" />

      {/* Question List Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <Title level={4} className="mb-4 text-gray-700">Quiz Questions</Title>
        <QuestionList
          questions={quizInfo.questions || []}
          onEdit={(q) => setEditingQuestion(q)}
          onDelete={deleteQuestion}
        />
      </div>

      {/* Save Quiz Button */}
      <Button
        type="primary"
        block
        size="large"
        onClick={handleSaveQuiz}
        loading={isPending}
        disabled={quizInfo.questions.length === 0 || !quizInfo.title.trim()}
        className="rounded-md shadow-lg hover:shadow-xl transition-all mt-8"
      >
        {isPending ? "Saving Quiz..." : "Save Quiz"}
      </Button>
    </section>
  );
}
