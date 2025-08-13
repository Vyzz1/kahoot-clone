import { useAuth } from "./useAuth";
import useAxiosPrivate from "./useAxiosPrivate";

export default function useBtnLogout() {
  const { deleteCurrentUser, setIsLoggedOut } = useAuth();

  const axiosPrivate = useAxiosPrivate({ type: "private" });

  const logout = async () => {
    deleteCurrentUser();
    setIsLoggedOut(true);
    const res = await axiosPrivate.get(`/auth/logout`, {
      withCredentials: true,
    });
    return res.data;
  };

  return logout;
}
