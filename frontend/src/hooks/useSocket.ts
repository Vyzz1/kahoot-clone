import { useAuth } from "@/hooks/useAuth";
import useRefreshToken from "@/hooks/useRefreshToken";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocket = () => {
  const { auth } = useAuth();

  const refresh = useRefreshToken();
  if (!socket) {
    socket = io("http://localhost:8080", {
      autoConnect: true,
      query: {
        token: auth?.accessToken,
      },
    });
  }

  socket.on("connect_error", async (err) => {
    console.error("Socket connection error:", err);
    if (err.name === "Unauthorized") {
      const newToken = await refresh();
      if (newToken) {
        socket?.connect();
      } else {
        console.error("Failed to refresh token");
      }
    }
  });

  return socket;
};
