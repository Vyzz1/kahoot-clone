import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/login";
import LayoutDefault from "./layout/layout-default";
import RegisterPage from "./pages/register";
import AuthLayout from "./layout/auth-layout";
import AdminLayout from "./layout/AdminLayout";
import { adminOnlyRoutes, settingsRoutes } from "@/routes/admin.routes";
import OwnerHostQuizzPage from "./pages/owner-host-quizz";
import PlayerHostQuizzPage from "./pages/player-host-quizz";
import JoinGamePage from "./pages/join-game";
import GameResult from "./pages/game-result";
import OAuthCallBack from "./pages/oauth-callback";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LayoutDefault />,
      children: [
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "register",
          element: <RegisterPage />,
        },
        {
          path: "admin",
          element: <AuthLayout allowedRole={["admin"]} />,
          children: [
            {
              index: true,
              element: <Navigate to="/admin/user-management" replace />,
            },
            {
              path: "",
              element: <AdminLayout />,
              children: adminOnlyRoutes,
            },
          ],
        },
        {
          path: "settings",
          element: <AuthLayout allowedRole={["admin", "user"]} />,
          children: [
            {
              index: true,
              element: <Navigate to="/settings/quiz-management" replace />,
            },
            {
              element: <AdminLayout />,
              children: settingsRoutes,
            },
          ],
        },
        {
          element: <AuthLayout allowedRole={["user", "admin"]} />,
          children: [
            {
              path: "owner-host-quizz",
              element: <OwnerHostQuizzPage />,
            },
            {
              path: "player-host-quizz",
              element: <PlayerHostQuizzPage />,
            },
            {
              path: "join-game",
              element: <JoinGamePage />,
            },
            {
              path: "game-played/:id/results",
              element: <GameResult />,
            },
          ],
        },
        {
          path: "oauth/google/callback",
          element: <OAuthCallBack />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
