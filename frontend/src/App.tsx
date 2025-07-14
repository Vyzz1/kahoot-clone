import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login";
import LayoutDefault from "./layout/layout-default";
import RegisterPage from "./pages/register";
import AuthLayout from "./layout/auth-layout";
import UserManagement from "./pages/user-management";
import { adminRoutes } from "@/routes/admin.routes";

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
        {
          path: "admin",
          element: <AuthLayout allowedRole={["admin", "user"]} />,
          children: adminRoutes,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
