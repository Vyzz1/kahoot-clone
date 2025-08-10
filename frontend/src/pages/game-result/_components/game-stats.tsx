import { Card, Statistic, Row, Col, Progress } from "antd";
import {
  TrophyOutlined,
  AimOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from "@ant-design/icons";

interface GameStatsProps {
  statistics: GameSessionResponse["statistics"];
  totalAnswered: number;
}

export default function GameStats({
  statistics,
  totalAnswered,
}: GameStatsProps) {
  const {
    totalQuestions,
    correctAnswers,
    accuracy,
    averageResponseTime,
    maxStreak,
    currentStreak,
    totalPoints,
    rank,
  } = statistics;

  const getRankColor = (rank: number) => {
    if (rank === 1) return "#f59e0b";
    if (rank === 2) return "#6b7280";
    if (rank === 3) return "#cd7c2f";
    return "#3b82f6";
  };

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  return (
    <Card title="Game Statistics" className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Final Rank"
            value={rank}
            prefix={<TrophyOutlined style={{ color: getRankColor(rank) }} />}
            valueStyle={{
              color: getRankColor(rank),
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Total Points"
            value={totalPoints}
            valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Accuracy"
            value={accuracy}
            suffix="%"
            prefix={<AimOutlined />}
            valueStyle={{
              color:
                accuracy >= 70
                  ? "#52c41a"
                  : accuracy >= 50
                  ? "#faad14"
                  : "#ff4d4f",
            }}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Avg Response Time"
            value={formatTime(averageResponseTime)}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Max Streak"
            value={maxStreak}
            prefix={<FireOutlined style={{ color: "#ff4d4f" }} />}
            valueStyle={{ color: "#ff4d4f" }}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Current Streak"
            value={currentStreak}
            prefix={<FireOutlined style={{ color: "#faad14" }} />}
            valueStyle={{ color: "#faad14" }}
          />
        </Col>
      </Row>

      <div className="space-y-6 mt-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Questions Corrected</span>
            <span className="font-medium">
              {correctAnswers}/{totalQuestions}
            </span>
          </div>
          <Progress
            percent={(correctAnswers / totalQuestions) * 100}
            strokeColor={{
              "0%": "#ff4d4f",
              "50%": "#faad14",
              "100%": "#52c41a",
            }}
            showInfo={false}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Questions Answered</span>
            <span className="font-medium">
              {totalAnswered} / {totalQuestions}
            </span>
          </div>
          <Progress
            percent={(totalAnswered / totalQuestions) * 100}
            strokeColor={{
              "0%": "#ff4d4f",
              "50%": "#faad14",
              "100%": "#52c41a",
            }}
            showInfo={false}
          />
        </div>
      </div>
    </Card>
  );
}
