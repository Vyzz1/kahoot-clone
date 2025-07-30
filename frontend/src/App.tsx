import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login";
import LayoutDefault from "./layout/layout-default";
import RegisterPage from "./pages/register";
import AuthLayout from "./layout/auth-layout";
import { adminRoutes } from "@/routes/admin.routes";
import OwnerHostQuizzPage from "./pages/owner-host-quizz";
import PlayerHostQuizzPage from "./pages/player-host-quizz";
import JoinGamePage from "./pages/join-game";

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
          element: <AuthLayout allowedRole={["admin", "user"]} />,
          children: adminRoutes,
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
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
