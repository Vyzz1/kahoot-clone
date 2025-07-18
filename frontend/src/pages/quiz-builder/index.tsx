import { useState, useEffect } from "react";
import { Button, Divider, message, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import QuizForm from "./quiz-form";
import QuestionForm from "./question-form";
import QuestionList from "./question-list";
import { useSaveQuiz } from "@/pages/quiz-builder/hooks/useSaveQuiz";
import { useAuth } from "../../hooks/useAuth";

import type { Quiz, Question } from "@/types/types";

// Define AuthenticatedUser and AuthContextType here
interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

interface AuthContextType {
  auth?: {
    user?: AuthenticatedUser | null;
    accessToken?: string;
  };
}

const { Title } = Typography;

// --- QuizBuilder Component ---
export default function QuizBuilder() {
  const navigate = useNavigate();
  const { auth } = useAuth() as AuthContextType;

  const [quizInfo, setQuizInfo] = useState<Quiz>({
    _id: uuidv4(), // Initialize _id with uuidv4() to satisfy Quiz interface requirement (it's mandatory)
    title: "",
    isPublic: false,
    description: "",
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: auth?.user?.userId || "", // Still initialize with auth user if available
    quizTimeLimit: 0,
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const { mutate: saveQuiz, isPending } = useSaveQuiz();

  // Add useEffect to log auth and quizInfo.user for debugging
  useEffect(() => {
    console.log("Auth state:", auth);
    console.log("quizInfo.user:", quizInfo.user);
  }, [auth, quizInfo.user]);

  // Add useEffect to log disabled conditions
  useEffect(() => {
    const hasQuestions = quizInfo.questions && quizInfo.questions.length > 0;
    const hasTitle = quizInfo.title.trim() !== "";
    const hasValidTimeLimit = quizInfo.quizTimeLimit !== undefined && quizInfo.quizTimeLimit > 0;

    console.log("--- Save Quiz Button Disabled Conditions ---");
    console.log("Has questions:", hasQuestions);
    console.log("Has title:", hasTitle);
    console.log("Has valid time limit:", hasValidTimeLimit);
    // Updated disabled state check: user check is removed for testing
    console.log("Button disabled state:", !(hasQuestions && hasTitle && hasValidTimeLimit));
    console.log("------------------------------------------");
  }, [quizInfo.questions, quizInfo.title, quizInfo.user, quizInfo.quizTimeLimit]);


  const addOrUpdateQuestion = (question: Question) => {
    setQuizInfo((prev) => {
      const currentQuestions = prev.questions || [];
      const exists = currentQuestions.find((q) => q._id === question._id);
      const updated = exists
        ? currentQuestions.map((q) => (q._id === question._id ? question : q))
        : [...currentQuestions, question];
      return { ...prev, questions: updated };
    });
    setEditingQuestion(null);
  };

  const deleteQuestion = (id: string) => {
    setQuizInfo((prev) => ({
      ...prev,
      questions: (prev.questions || []).filter((q) => q._id !== id),
    }));
  };

  const handleReorderQuestions = (newOrder: Question[]) => {
    setQuizInfo(prev => ({
      ...prev,
      questions: newOrder,
    }));
  };

  const handleSaveQuiz = () => {
    if (!quizInfo.title.trim()) {
      message.error("Quiz title cannot be empty!");
      return;
    }
    if (!quizInfo.questions || quizInfo.questions.length === 0) {
      message.warning("Please add at least one question to the quiz.");
      return;
    }
    // TEMPORARILY REMOVED FOR TESTING: This check is for actual user authentication.
    // If you enable this, ensure user is logged in for the button to work.
    // if (!quizInfo.user) {
    //   message.error("User ID is missing. Please log in.");
    //   return;
    // }
    if (quizInfo.quizTimeLimit === undefined || quizInfo.quizTimeLimit <= 0) {
      message.error("Overall Quiz Time Limit must be a positive number!");
      return;
    }

    console.log("Quiz data being saved:", quizInfo);

    saveQuiz(quizInfo, {
      onSuccess: (createdQuiz) => {
        message.success("Quiz saved successfully!");
        setQuizInfo(prev => ({
          ...prev,
          _id: createdQuiz._id,
          questions: prev.questions.map(q => ({
            ...q,
            quizId: createdQuiz._id,
          }))
        }));
        navigate("/admin/quiz-management");
      },
      onError: (err: any) => {
        console.error("Failed to save quiz:", err.response || err);
        message.error(err.response?.data?.message || "Failed to save quiz.");
      },
    });
  };

  return (
    <section className="max-w-5xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen rounded-xl shadow-lg font-sans">
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
        <Title level={4} className="mb-4 text-gray-700">Quiz Information</Title>
        <QuizForm quiz={quizInfo} setQuiz={setQuizInfo} />
      </div>

      <Divider className="my-6" />

      {/* Question Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <Title level={4} className="mb-4 text-gray-700">Add/Edit Question</Title>
        <QuestionForm
          quizId={quizInfo._id || ""}
          onAdd={addOrUpdateQuestion}
          editingQuestion={editingQuestion}
          key={editingQuestion?._id || "new"}
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
          onReorder={handleReorderQuestions}
        />
      </div>

      {/* Action Buttons Section */}
      <Flex justify="center" gap="middle" className="mt-8">
        <Button
          type="primary"
          block
          size="large"
          onClick={handleSaveQuiz}
          loading={isPending}
          // User check is removed from disabled condition for testing
          disabled={!quizInfo.questions || quizInfo.questions.length === 0 || !quizInfo.title.trim() || quizInfo.quizTimeLimit === undefined || quizInfo.quizTimeLimit <= 0}
          className="rounded-md shadow-lg hover:shadow-xl transition-all"
        >
          {isPending ? "Saving Quiz..." : "Save Quiz"}
        </Button>
      </Flex>
    </section>
  );
}