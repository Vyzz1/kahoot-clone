import { Card, Typography, Avatar, Tag } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface GameInfoHeaderProps {
  gameSession: GameSessionResponse["gameSession"];
}

export default function GameInfoHeader({ gameSession }: GameInfoHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startedAt: string, finishedAt?: string) => {
    const start = new Date(startedAt);
    const end = finishedAt ? new Date(finishedAt) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60);

    if (duration < 60) {
      return `${duration} minutes`;
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished":
        return "success";
      case "in_progress":
        return "processing";
      case "waiting":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "finished":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "waiting":
        return "Waiting";
      default:
        return status;
    }
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={gameSession.player.avatar}
            size={64}
            icon={<UserOutlined />}
          />
          <div>
            <Title level={3} className="mb-1">
              {gameSession.game.quiz.title}
            </Title>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <UserOutlined />
                Playing as: <strong>{gameSession.displayName}</strong>
              </span>
              <span className="flex items-center gap-1">
                <strong>PIN:</strong> {gameSession.game.pin}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right space-y-2!">
          <Tag color={getStatusColor(gameSession.game.status)}>
            {getStatusText(gameSession.game.status)}
          </Tag>
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-1 mb-1">
              <CalendarOutlined />
              Started: {formatDate(gameSession.game.startedAt)}
            </div>
            {gameSession.game.finishedAt && (
              <div className="flex items-center gap-1 mb-1">
                <CalendarOutlined />
                Finished: {formatDate(gameSession.game.finishedAt)}
              </div>
            )}
            <div className="flex items-center gap-1">
              <ClockCircleOutlined />
              Duration:{" "}
              {formatDuration(
                gameSession.game.startedAt,
                gameSession.game.finishedAt
              )}
            </div>
          </div>
        </div>
      </div>

      {gameSession.game.quiz.description && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <Text type="secondary">{gameSession.game.quiz.description}</Text>
        </div>
      )}
    </Card>
  );
}
