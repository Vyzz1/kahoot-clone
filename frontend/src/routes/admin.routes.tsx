// src/routes/admin.routes.tsx
import type { RouteObject } from "react-router-dom";
import UserManagement from "@/pages/user-management";
import QuizManagement from "@/pages/quiz-management";
import QuestionManagement from "@/pages/question-management";
import QuizBuilder from "@/pages/quiz-builder";
import MigrationPage from "@/pages/MigrationPage/MigrationPage";

// Admin-only routes (user-management and migration)
export const adminOnlyRoutes: RouteObject[] = [
  {
    path: "user-management",
    element: <UserManagement />,
  },
  {
    path: "migrate",
    element: <MigrationPage />,
  },
];

// Settings routes (accessible by both admin and user)
export const settingsRoutes: RouteObject[] = [
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

// Legacy admin routes for backward compatibility
export const adminRoutes: RouteObject[] = [
  ...adminOnlyRoutes,
  ...settingsRoutes,
];
