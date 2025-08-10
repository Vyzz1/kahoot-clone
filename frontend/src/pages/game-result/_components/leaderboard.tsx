import { Card, Table, Tag, Avatar } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

interface LeaderboardProps {
  leaderboard: GameSessionResponse["leaderboard"];
  currentPlayerId: string;
}

export default function Leaderboard({
  leaderboard,
  currentPlayerId,
}: LeaderboardProps) {
  const columns = [
    {
      title: "Rank",
      dataIndex: "finalRank",
      key: "rank",
      width: 80,
      render: (rank: number, _record: any, index: number) => {
        const position = rank || index + 1;
        const getRankIcon = (pos: number) => {
          if (pos === 1) return "🏆";
          if (pos === 2) return "🥈";
          if (pos === 3) return "🥉";
          return pos;
        };

        return (
          <div className="flex items-center justify-center">
            <span className="text-lg font-bold">{getRankIcon(position)}</span>
          </div>
        );
      },
    },
    {
      title: "Player",
      key: "player",
      render: (record: any) => {
        const isCurrentPlayer = record.player._id === currentPlayerId;
        return (
          <div className="flex items-center gap-3">
            <Avatar src={record.player.avatar} size="large">
              {record.player.fullName.charAt(0)}
            </Avatar>
            <div>
              <div
                className={`font-medium ${
                  isCurrentPlayer ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {record.displayName}
                {isCurrentPlayer && (
                  <Tag color="blue" className="ml-2">
                    You
                  </Tag>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {record.player.fullName}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Score",
      dataIndex: "totalScore",
      key: "score",
      width: 120,
      render: (score: number) => (
        <div className="text-right">
          <span className="text-lg font-bold text-green-600">
            {score.toLocaleString()}
          </span>
          <div className="text-xs text-gray-500">points</div>
        </div>
      ),
    },
    {
      title: "Accuracy",
      key: "accuracy",
      width: 120,
      render: (record: any) => {
        const accuracy =
          record.totalAnswered > 0
            ? (record.correctAnswers / record.totalAnswered) * 100
            : 0;

        const getAccuracyColor = (acc: number) => {
          if (acc >= 80) return "text-green-600";
          if (acc >= 60) return "text-yellow-600";
          return "text-red-600";
        };

        return (
          <div className="text-right">
            <span className={`font-medium ${getAccuracyColor(accuracy)}`}>
              {accuracy.toFixed(1)}%
            </span>
            <div className="text-xs text-gray-500">
              {record.correctAnswers}/{record.totalAnswered}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <TrophyOutlined className="text-yellow-500" />
          <span>Leaderboard</span>
        </div>
      }
      className="mb-6"
    >
      <Table
        columns={columns}
        dataSource={leaderboard}
        rowKey={(record) => record._id}
        pagination={false}
        size="middle"
        rowClassName={(record) =>
          record.player._id === currentPlayerId ? "bg-blue-50" : ""
        }
      />
    </Card>
  );
}
