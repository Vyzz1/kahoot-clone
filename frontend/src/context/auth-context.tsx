import { createContext, useState } from "react";
import type { CurrentUserType } from "@/types/global";

type AuthType = {
  accessToken: string;
};

type AuthContextType = {
  auth: AuthType | undefined;
  setAuth: React.Dispatch<React.SetStateAction<AuthType | undefined>>;
  currentUser: CurrentUserType | null;
  updateCurrentUser: (user: CurrentUserType) => void;
  deleteCurrentUser: () => void;
  isLoggedOut: boolean;
  setIsLoggedOut: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType>({
  auth: undefined,
  setAuth: () => {},
  currentUser: null,
  updateCurrentUser: () => {},
  deleteCurrentUser: () => {},
  isLoggedOut: false,
  setIsLoggedOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthType | undefined>(undefined);

  const [currentUser, setCurrentUser] = useState<CurrentUserType | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);

  const updateCurrentUser = (user: CurrentUserType) => {
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const deleteCurrentUser = () => {
    setCurrentUser(null);
    setAuth(undefined);
    localStorage.removeItem("user");
    setIsLoggedOut(true);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        currentUser,
        deleteCurrentUser,
        updateCurrentUser,
        isLoggedOut,
        setIsLoggedOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
