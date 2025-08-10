import { Card, List, Avatar, Tag, Typography } from "antd";
import { UserOutlined, TrophyOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface LeaderboardProps {
  players: Player[];
  title?: string;
  showRanking?: boolean;
  maxItems?: number;
}

export default function Leaderboard({
  players,
  title = "Leaderboard",
  showRanking = true,
  maxItems,
}: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const displayPlayers = maxItems
    ? sortedPlayers.slice(0, maxItems)
    : sortedPlayers;

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🏆";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return null;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "gold";
      case 1:
        return "default";
      case 2:
        return "orange";
      default:
        return "blue";
    }
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <TrophyOutlined />
          {title}
        </div>
      }
    >
      <List
        dataSource={displayPlayers}
        renderItem={(player, index) => {
          const correctAnswers = player.answers.filter(
            (a) => a.isCorrect
          ).length;
          const totalAnswers = player.answers.length;
          const rankIcon = getRankIcon(index);

          return (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <div className="flex items-center gap-2">
                    {showRanking && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : index === 2
                            ? "bg-orange-600"
                            : "bg-blue-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                    )}
                    <Avatar src={player.avatar} icon={<UserOutlined />} />
                  </div>
                }
                title={
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{player.displayName}</span>
                    {rankIcon && <span className="text-lg">{rankIcon}</span>}
                    <Tag color={getRankColor(index)}>{player.score} pts</Tag>
                  </div>
                }
                description={
                  <div className="flex items-center gap-4">
                    <Text type="secondary">
                      Accuracy:{" "}
                      {totalAnswers > 0
                        ? Math.round((correctAnswers / totalAnswers) * 100)
                        : 0}
                      %
                    </Text>
                    <Text type="secondary">
                      Correct: {correctAnswers}/{totalAnswers}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
}
