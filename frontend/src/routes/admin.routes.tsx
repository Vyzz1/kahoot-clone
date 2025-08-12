// src/routes/admin.routes.tsx
import type { RouteObject } from "react-router-dom";
import UserManagement from "@/pages/user-management";
import QuizManagement from "@/pages/quiz-management";
import QuestionManagement from "@/pages/question-management";
import QuizBuilder from "@/pages/quiz-builder";
import MigrationPage from "@/pages/MigrationPage/MigrationPage";
import GameHostedPage from "@/pages/game-hosted";
import GamePlayedPage from "@/pages/game-played";
import ChangePasswordPage from "@/pages/change-password";

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
  {
    path: "game-hosted",
    element: <GameHostedPage />,
  },
  {
    path: "game-played",
    element: <GamePlayedPage />,
  },
  {
    path: "change-password",
    element: <ChangePasswordPage />,
  },
];

export const adminRoutes: RouteObject[] = [
  ...adminOnlyRoutes,
  ...settingsRoutes,
];
