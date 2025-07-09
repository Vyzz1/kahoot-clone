import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import PersitentLogin from "./persitent-login";

interface AuthLayoutProps {
  allowedRole: string[];
}
const AuthLayout: React.FC<AuthLayoutProps> = ({ allowedRole }) => {
  const { auth, currentUser } = useAuth();

  const location = useLocation();

  if (!currentUser)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return (
    <>
      {allowedRole.find((role) =>
        currentUser.role.toLowerCase().includes(role.toLowerCase())
      ) ? (
        <>
          <main className="antialiased min-h-screen w-full">
            <PersitentLogin isInProtectedRoutes>
              <Outlet />
            </PersitentLogin>
          </main>
        </>
      ) : auth ? (
        <>
          <div>
            Unauthorized to view this page. Please contact your administrator.
          </div>
        </>
      ) : (
        <>
          <Navigate to="/login" replace state={{ from: location }} />
        </>
      )}
    </>
  );
};

export default AuthLayout;
