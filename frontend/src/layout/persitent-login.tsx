/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useAuth } from "@/hooks/useAuth";
import useRefreshToken from "@/hooks/useRefreshToken";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
const PersitentLogin = ({
  children,
  isShowLoading = true,
  isInProtectedRoutes = true,
  className,
}: {
  className?: string;
  isSmallScreen?: boolean;
  isShowLoading?: boolean;
  children: React.ReactNode;
  isInProtectedRoutes: boolean;
}) => {
  const [loading, setLoading] = useState(true);

  const { auth, isLoggedOut } = useAuth();

  const refresh = useRefreshToken(isInProtectedRoutes);
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await refresh();
      } catch (error) {
        console.error("Refresh token error:", error);
      } finally {
        setLoading(false);
      }
    };

    !auth?.accessToken && !isLoggedOut ? verifyToken() : setLoading(false);
  }, [auth, refresh, isLoggedOut]);

  return (
    <>
      {loading ? (
        isShowLoading ? (
          <div
            className={cn(
              "flex justify-center items-center h-screen",
              className
            )}
          >
            <h2>Loading...</h2>
          </div>
        ) : (
          <> </>
        )
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default PersitentLogin;
