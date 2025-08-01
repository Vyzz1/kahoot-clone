import { Card, Table } from "antd";
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

interface LeaderboardEntry {
  id: string;
  displayName: string;
  score: number;
  rank: number;
  lastAnswerCorrect?: boolean;
  lastPointsEarned?: number;
}

const columns = [
  {
    title: "Hạng",
    dataIndex: "rank",
    key: "rank",
  },
  {
    title: "Người chơi",
    dataIndex: "displayName",
    key: "displayName",
  },
  {
    title: "Điểm",
    dataIndex: "score",
    key: "score",
  },
  {
    title: "✅",
    dataIndex: "lastAnswerCorrect",
    key: "lastAnswerCorrect",
    render: (value: boolean) => (value ? "✔️" : "❌"),
  },
  {
    title: "Điểm câu trước",
    dataIndex: "lastPointsEarned",
    key: "lastPointsEarned",
  },
];

export default function LeaderboardPanel({ gameId }: { gameId: string }) {
  const socket = useSocket();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("getLeaderboard", { gameId });

    socket.on("currentLeaderboard", ({ leaderboard }: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(leaderboard);
    });

    socket.on("questionEnded", ({ leaderboard }: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(leaderboard);
    });

    return () => {
      socket.off("currentLeaderboard");
      socket.off("questionEnded");
    };
  }, [socket, gameId]);

  return (
    <Card title="🏆 Bảng xếp hạng">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={leaderboard}
        pagination={false}
        size="small"
      />
    </Card>
  );
}
