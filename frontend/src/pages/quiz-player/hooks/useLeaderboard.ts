// hooks/useLeaderboard.ts
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalScore: number;
  correctAnswers: number;
  totalAnswered: number;
  averageResponseTime: number;
}

export const useLeaderboard = (gameId: string) => {
  const socket = useSocket();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!socket || !gameId) return;

    socket.emit("join-leaderboard", { gameId });

    socket.on("leaderboard-update", (data: LeaderboardEntry[]) => {
      setLeaderboard(data);
    });

    return () => {
      socket.off("leaderboard-update");
      socket.emit("leave-leaderboard", { gameId });
    };
  }, [socket, gameId]);

  return leaderboard;
};
