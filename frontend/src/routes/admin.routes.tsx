import type { RouteObject } from "react-router-dom";
import UserManagement from "@/pages/user-management";
import QuizManagement from "@/pages/quiz-management";
import QuestionManagement from "@/pages/question-management";
import QuizBuilder from "@/pages/quiz-builder";

export const adminRoutes: RouteObject[] = [
  {
    path: "user-management",
    element: <UserManagement />,
  },
  {
    path: "quiz-management",
    element: <QuizManagement />,
  },
  {
    path: "question-management",
    element: <QuestionManagement />,
  },
  {
    path: "quiz-builder",
    element: <QuizBuilder />,
  },
];
