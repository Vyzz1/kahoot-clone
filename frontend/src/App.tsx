import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login";
import LayoutDefault from "./layout/layout-default";
import UserManagement from "./pages/user-management";
import RegisterPage from "./pages/register";
import AuthLayout from "./layout/auth-layout";

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
          element: <AuthLayout allowedRole={["user"]} />,
          children: [
            {
              path: "user-management",
              element: <UserManagement />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
