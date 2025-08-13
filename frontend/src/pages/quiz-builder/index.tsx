import { useState, useEffect } from "react";
import { Button, Divider, message, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import QuizForm from "./components/quiz-form-bd";
import QuestionForm from "./components/question-form-bd";
import QuestionList from "./components/question-list-bd";
import { useSaveQuiz } from "@/pages/quiz-builder/hooks/useSaveQuiz";
import { useAuth } from "../../hooks/useAuth";

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


export default function QuizBuilder() {
  const navigate = useNavigate();
  const { auth } = useAuth() as AuthContextType;

  const [quizInfo, setQuizInfo] = useState<Quiz>({
    _id: uuidv4(), 
    title: "",
    isPublic: false,
    description: "",
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: auth?.user?.userId || "", 
    quizTimeLimit: 0,
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const { mutate: saveQuiz, isPending } = useSaveQuiz();

  useEffect(() => {
    console.log("Auth state:", auth);
    console.log("quizInfo.user:", quizInfo.user);
  }, [auth, quizInfo.user]);

  useEffect(() => {
    const hasQuestions = quizInfo.questions && quizInfo.questions.length > 0;
    const hasTitle = quizInfo.title.trim() !== "";

    console.log("--- Save Quiz Button Disabled Conditions ---");
    console.log("Has questions:", hasQuestions);
    console.log("Has title:", hasTitle);

    console.log(
      "Button disabled state:",
      !(hasQuestions && hasTitle )
    );
    console.log("------------------------------------------");
  }, [
    quizInfo.questions,
    quizInfo.title,
    quizInfo.user,
  ]);

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
    setQuizInfo((prev) => ({
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

    if (quizInfo.quizTimeLimit === undefined || quizInfo.quizTimeLimit <= 0) {
      message.error("Overall Quiz Time Limit must be a positive number!");
      return;
    }

    console.log("Quiz data being saved:", quizInfo);

    saveQuiz(quizInfo, {
      onSuccess: (createdQuiz) => {
        message.success("Quiz saved successfully!");
        setQuizInfo((prev) => ({
          ...prev,
          _id: createdQuiz._id,
          questions: prev.questions.map((q) => ({
            ...q,
            quizId: createdQuiz._id,
          })),
        }));
        navigate("/settings/quiz-management");
      },
      onError: (err: any) => {
        console.error("Failed to save quiz:", err.response || err);
        message.error(err.response?.data?.message || "Failed to save quiz.");
      },
    });
  };

  return (
    <section className="max-w-5xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen rounded-xl shadow-lg font-sans">
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <Title level={3} className="m-0 text-gray-800">
          🎨 Create New Quiz
        </Title>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => navigate("/settings/question-management")}
            className="rounded-md shadow-sm hover:shadow-md transition-all"
          >
            Question Management
          </Button>
          <Button
            onClick={() => navigate("/settings/quiz-management")}
            className="rounded-md shadow-sm hover:shadow-md transition-all"
          >
            Back to Quiz List
          </Button>
        </div>
      </Flex>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <Title level={4} className="mb-4 text-gray-700">
          Quiz Information
        </Title>
        <QuizForm quiz={quizInfo} setQuiz={setQuizInfo} />
      </div>

      <Divider className="my-6" />

      <div className="bg-white p-6 rounded-xl shadow-md">
        <Title level={4} className="mb-4 text-gray-700">
          Add/Edit Question
        </Title>
        <QuestionForm
          quizId={quizInfo._id || ""}
          onAdd={addOrUpdateQuestion}
          editingQuestion={editingQuestion}
          key={editingQuestion?._id || "new"}
        />
      </div>

      <Divider className="my-6" />

      <div className="bg-white p-6 rounded-xl shadow-md">
        <Title level={4} className="mb-4 text-gray-700">
          Quiz Questions
        </Title>
        <QuestionList
          questions={quizInfo.questions || []}
          onEdit={(q) => setEditingQuestion(q)}
          onDelete={deleteQuestion}
          onReorder={handleReorderQuestions}
        />
      </div>

      <Flex justify="center" gap="middle" className="mt-8">
        <Button
          type="primary"
          block
          size="large"
          onClick={handleSaveQuiz}
          loading={isPending}
          disabled={
            !quizInfo.questions ||
            quizInfo.questions.length === 0 ||
            !quizInfo.title.trim() 
          }
          className="rounded-md shadow-lg hover:shadow-xl transition-all"
        >
          {isPending ? "Saving Quiz..." : "Save Quiz"}
        </Button>
      </Flex>
    </section>
  );
}
