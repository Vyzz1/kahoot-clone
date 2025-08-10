import React from "react";
import { Card, List, Avatar, Tag, Typography, Divider } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  CrownOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface PlayerData {
  id: string;
  displayName: string;
  avatar: string;
}

interface LeaderboardPlayer {
  id: string;
  displayName: string;
  score: number;
  rank: number;
  lastAnswerCorrect?: boolean;
  lastPointsEarned?: number;
  avatar?: string;
}

interface PlayerLeaderboardProps {
  leaderboard: LeaderboardPlayer[];
  currentPlayer?: PlayerData;
  gameState?: any;
  currentQuestion?: Question;
  currentAnswerResult?: {
    isCorrect?: boolean;
    pointsEarned?: number;
    totalScore?: number;
    correctAnswer: any;
    answerTime?: number;
  };
  correctAnswer: CorrectAnswer;
}

const PlayerLeaderboard: React.FC<PlayerLeaderboardProps> = ({
  leaderboard,
  currentPlayer,
  gameState,
  currentQuestion,
  currentAnswerResult,
  correctAnswer,
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <CrownOutlined style={{ color: "#fadb14", fontSize: "20px" }} />;
      case 2:
        return (
          <TrophyOutlined style={{ color: "#d9d9d9", fontSize: "18px" }} />
        );
      case 3:
        return (
          <TrophyOutlined style={{ color: "#fa8c16", fontSize: "18px" }} />
        );
      default:
        return (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {rank}
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "gold";
      case 2:
        return "default";
      case 3:
        return "orange";
      default:
        return "blue";
    }
  };

  const currentPlayerData =
    currentPlayer && gameState?.players
      ? gameState.players.find((p: any) => p.id === currentPlayer.id)
      : null;

  return (
    <div className="space-y-6">
      {currentQuestion && (
        <Card
          size="small"
          className="border-green-200 bg-green-50"
          title={
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircleOutlined />
              <span>Correct Answer</span>
            </div>
          }
        >
          {currentQuestion.type !== "ordering" &&
            typeof correctAnswer === "string" && <Text>{correctAnswer}</Text>}

          {currentQuestion.type === "ordering" &&
            Array.isArray(correctAnswer) && (
              <Text>{correctAnswer.join("->")}</Text>
            )}
        </Card>
      )}

      {currentPlayerData && (
        <Card
          size="small"
          className="border-blue-200 bg-blue-50"
          title={
            <div className="flex items-center gap-2 text-blue-800">
              <UserOutlined />
              <span>Your Result</span>
            </div>
          }
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text className="text-blue-700">
                <strong>Status:</strong>
              </Text>
              <Tag
                color={
                  currentAnswerResult
                    ? currentAnswerResult.isCorrect
                      ? "success"
                      : "error"
                    : "warning"
                }
                icon={
                  currentAnswerResult ? (
                    currentAnswerResult.isCorrect ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CloseCircleOutlined />
                    )
                  ) : null
                }
              >
                {currentAnswerResult
                  ? currentAnswerResult.isCorrect
                    ? "Correct!"
                    : "Incorrect"
                  : "No answer submitted"}
              </Tag>
            </div>

            {currentAnswerResult && (
              <>
                <div className="flex items-center justify-between">
                  <Text className="text-blue-700">
                    <strong>Points Earned:</strong>
                  </Text>
                  <Tag color="green">+{currentAnswerResult.pointsEarned}</Tag>
                </div>
                <div className="flex items-center justify-between">
                  <Text className="text-blue-700">
                    <strong>Answer Time:</strong>
                  </Text>
                  <Tag>{currentAnswerResult.answerTime?.toFixed(1)}s</Tag>
                </div>
              </>
            )}

            <Divider className="my-2" />
            <div className="flex items-center justify-between">
              <Text className="text-blue-700">
                <strong>Total Score:</strong>
              </Text>
              <Text className="text-xl font-bold text-blue-600">
                {currentPlayerData.score}
              </Text>
            </div>
          </div>
        </Card>
      )}

      {leaderboard && leaderboard.length > 0 && (
        <Card
          title={
            <div className="text-center">
              <Title
                level={4}
                className="mb-0 flex items-center justify-center gap-2"
              >
                <TrophyOutlined className="text-yellow-500" />
                Current Leaderboard
              </Title>
            </div>
          }
          className="shadow-md"
        >
          <List
            dataSource={leaderboard.slice(0, 10)}
            renderItem={(player, index) => (
              <List.Item
                className={`transition-all duration-200 rounded-lg mb-2 p-3 ${
                  currentPlayer && player.id === currentPlayer.id
                    ? "bg-yellow-50 border border-yellow-300 shadow-sm"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <List.Item.Meta
                  avatar={
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      <Avatar
                        size="large"
                        src={player.avatar || <UserOutlined />}
                        className="bg-blue-500"
                      />
                    </div>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <Text strong className="text-lg">
                        {player.displayName}
                        {currentPlayer && player.id === currentPlayer.id && (
                          <Tag color="gold" className="ml-2">
                            You
                          </Tag>
                        )}
                      </Text>
                      <Tag color={getRankBadgeColor(index + 1)}>
                        #{index + 1}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="flex items-center gap-2">
                      {player.lastAnswerCorrect !== undefined && (
                        <Tag
                          color={player.lastAnswerCorrect ? "success" : "error"}
                          icon={
                            player.lastAnswerCorrect ? (
                              <CheckCircleOutlined />
                            ) : (
                              <CloseCircleOutlined />
                            )
                          }
                        >
                          {player.lastAnswerCorrect ? "Correct" : "Incorrect"}
                          {player.lastPointsEarned !== undefined &&
                            ` (+${player.lastPointsEarned})`}
                        </Tag>
                      )}
                    </div>
                  }
                />
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {player.score}
                  </div>
                  <Text type="secondary" className="text-sm">
                    points
                  </Text>
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default PlayerLeaderboard;
