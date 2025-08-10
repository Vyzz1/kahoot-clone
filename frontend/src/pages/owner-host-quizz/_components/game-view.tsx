import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Progress,
  Typography,
  Tag,
  List,
  Avatar,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getGameSettings } from "@/utils/gameSettings";

const { Title, Text } = Typography;

interface GameViewProps {
  gameId: string;
  gameState: GameState;
  onNextQuestion: () => void;
  onEndQuestion: () => void;
  onForceEndGame: () => void;
  currentQuestion?: Question;
}

export default function GameView({
  gameId,
  gameState,

  onNextQuestion,
  onEndQuestion,
  onForceEndGame,
  currentQuestion,
}: GameViewProps) {
  const gameSettings = getGameSettings(gameId);

  const [timeRemaining, setTimeRemaining] = useState(0);

  const [endingQuestion, setEndingQuestion] = useState(false);

  const [isClickEndQuestion, setIsClickEndQuestion] = useState(false);

  const isLastQuestion =
    gameState.currentQuestionIndex >= gameState.totalQuestions - 1;
  const answeredPlayers = (gameState.players || []).filter((player) =>
    player.answers.some(
      (answer) => answer.questionIndex === gameState.currentQuestionIndex
    )
  );

  useEffect(() => {
    if (endingQuestion && gameState.isCurrentQuestionEnded === false) {
      onEndQuestion();
      console.log("Auto end question");
      setEndingQuestion(false);
    }
  }, [gameState.isCurrentQuestionEnded, endingQuestion, onEndQuestion]);

  //auto next question

  useEffect(() => {
    if (!gameState.questionEndTime) return;

    if (!gameSettings?.autoNextQuestion) return;

    const timer = setTimeout(() => {
      onNextQuestion();
    }, Number(gameSettings.autoNextQuestionDelay) * 1000 || 3000);

    return () => clearTimeout(timer);
  }, [
    gameState.questionEndTime,
    gameSettings?.autoNextQuestion,
    gameSettings?.autoNextQuestionDelay,
    onNextQuestion,
  ]);

  useEffect(() => {
    if (!gameState.questionEndTime) return;

    if (!isClickEndQuestion) {
      const timer = setInterval(() => {
        const now = Date.now();
        const endTime = new Date(gameState.questionEndTime!).getTime();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

        setTimeRemaining(remaining);

        if (remaining === 0) {
          console.log("Time's up!");
          clearInterval(timer);
          if (gameSettings?.autoEndQuestion) {
            console.log("Auto ending question due to time limit");
            setEndingQuestion(true);
          }
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [
    gameSettings?.autoEndQuestion,
    gameState.questionEndTime,
    isClickEndQuestion,
  ]);

  const getAnswerStats = () => {
    if (!currentQuestion) return [];

    if (
      currentQuestion.type === "multiple_choice" ||
      currentQuestion.type === "true_false" ||
      currentQuestion.type === "poll"
    ) {
      if (!currentQuestion.options) return [];

      return currentQuestion.options.map((option) => {
        const answerCount = (gameState.players || []).filter((player) => {
          const answer = player.answers.find(
            (a) => a.questionIndex === gameState.currentQuestionIndex
          );
          return answer?.answerId === option._id;
        }).length;

        return {
          ...option,
          count: answerCount,
          percentage:
            (gameState.players || []).length > 0
              ? (answerCount / (gameState.players || []).length) * 100
              : 0,
        };
      });
    }

    if (currentQuestion.type === "short_answer") {
      const answers = (gameState.players || [])
        .map((player) => {
          const answer = player.answers.find(
            (a) => a.questionIndex === gameState.currentQuestionIndex
          );
          return answer?.answerData?.text || null;
        })
        .filter(Boolean);

      const answerGroups: Record<string, { text: string; count: number }> =
        answers.reduce((acc, answer) => {
          const key = answer.toLowerCase().trim();
          if (!acc[key]) {
            acc[key] = { text: answer, count: 0 };
          }
          acc[key].count++;
          return acc;
        }, {} as Record<string, { text: string; count: number }>);

      return Object.values(answerGroups).map((group, index) => ({
        _id: `answer-${index}`,
        text: group.text,
        count: group.count,
        percentage:
          (gameState.players || []).length > 0
            ? (group.count / (gameState.players || []).length) * 100
            : 0,
        isCorrect:
          group.text.toLowerCase().trim() ===
          currentQuestion.answerText?.toLowerCase().trim(),
      }));
    }

    if (currentQuestion.type === "ordering") {
      const correctCount = (gameState.players || []).filter((player) => {
        const answer = player.answers.find(
          (a) => a.questionIndex === gameState.currentQuestionIndex
        );
        return answer?.isCorrect;
      }).length;

      const incorrectCount = (gameState.players || []).length - correctCount;

      return [
        {
          _id: "correct-order",
          text: "Correct Order",
          count: correctCount,
          percentage:
            (gameState.players || []).length > 0
              ? (correctCount / (gameState.players || []).length) * 100
              : 0,
          isCorrect: true,
        },
        {
          _id: "incorrect-order",
          text: "Incorrect Order",
          count: incorrectCount,
          percentage:
            (gameState.players || []).length > 0
              ? (incorrectCount / (gameState.players || []).length) * 100
              : 0,
          isCorrect: false,
        },
      ];
    }

    return [];
  };

  const renderQuestionContent = () => (
    <Card className="mb-6">
      <div className="text-center mb-4">
        <Title level={3}>
          Question {gameState.currentQuestionIndex + 1} of{" "}
          {gameState.totalQuestions}
        </Title>
        <Text type="secondary">{currentQuestion?.content}</Text>
      </div>

      {currentQuestion?.media?.image && (
        <div className="text-center mb-4">
          <img
            src={currentQuestion.media.image}
            alt="Question media"
            className="max-w-full h-auto rounded-lg max-h-64"
          />
        </div>
      )}

      {currentQuestion?.media?.video && (
        <div className="text-center mb-4">
          <video
            src={currentQuestion.media.video}
            controls
            className="max-w-full h-auto rounded-lg max-h-64"
          />
        </div>
      )}

      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Statistic
            title="Time Remaining"
            value={timeRemaining}
            suffix="s"
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: timeRemaining <= 10 ? "#ff4d4f" : "#1890ff" }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Answered"
            value={answeredPlayers.length}
            suffix={`/ ${(gameState.players || []).length}`}
            prefix={<UserOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Points"
            value={currentQuestion?.points || 0}
            prefix="🏆"
          />
        </Col>
      </Row>

      <Progress
        percent={(timeRemaining / (currentQuestion?.timeLimit || 1)) * 100}
        showInfo={false}
        strokeColor={timeRemaining <= 10 ? "#ff4d4f" : "#1890ff"}
        className="mb-4"
      />
    </Card>
  );

  const renderAnswerStats = () => {
    if (!currentQuestion) return null;

    const answerStats = getAnswerStats();
    if (answerStats.length === 0) return null;

    let title = "Answer Distribution";
    if (currentQuestion.type === "short_answer") {
      title = "Answer Responses";
    } else if (currentQuestion.type === "ordering") {
      title = "Ordering Results";
    } else if (currentQuestion.type === "poll") {
      title = "Poll Results";
    }

    return (
      <Card title={title} className="mb-6">
        <div className="space-y-3">
          {answerStats.map((option, index) => (
            <div
              key={option._id || `stat-${index}`}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    option.isCorrect ? "bg-green-500" : "bg-blue-500"
                  }`}
                >
                  {currentQuestion.type === "short_answer" ||
                  currentQuestion.type === "ordering"
                    ? index + 1
                    : String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium">{option.text}</span>
                {option.isCorrect && (
                  <CheckCircleOutlined className="text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  percent={option.percentage}
                  showInfo={false}
                  strokeColor={option.isCorrect ? "#52c41a" : "#1890ff"}
                  className="w-24"
                />
                <span className="font-bold text-lg">{option.count}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderPlayerList = () => (
    <Card title="Player Answers" className="mb-6">
      <List
        dataSource={gameState.players || []}
        renderItem={(player) => {
          const answer = player.answers.find(
            (a) => a.questionIndex === gameState.currentQuestionIndex
          );
          const hasAnswered = !!answer;
          const isCorrect = answer?.isCorrect || false;

          return (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={player.avatar} icon={<UserOutlined />} />}
                title={
                  <div className="flex items-center gap-2">
                    <span>{player.displayName}</span>
                    <Tag color="blue">Score: {player.score}</Tag>
                    {hasAnswered && (
                      <Tag color={isCorrect ? "green" : "red"}>
                        {isCorrect ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )}
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Tag>
                    )}
                  </div>
                }
                description={
                  hasAnswered ? (
                    <div>
                      <Text type="secondary">
                        Answer time: {answer.answerTime}s | Points earned:{" "}
                        {answer.pointsEarned}
                      </Text>
                    </div>
                  ) : (
                    <Text type="secondary">
                      {gameState.isCurrentQuestionEnded
                        ? "No answer"
                        : "Waiting for answering"}
                    </Text>
                  )
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
  const renderControls = () => (
    <Card title="Game Controls">
      <div className="flex gap-3 flex-wrap">
        {gameState.status === "in_progress" &&
          !gameState.isCurrentQuestionEnded && (
            <Button
              type="primary"
              danger
              onClick={() => {
                onEndQuestion();
                setTimeRemaining(0);
                clearInterval(timeRemaining);
                setEndingQuestion(false);
                setIsClickEndQuestion(true);
              }}
            >
              End Current Question
            </Button>
          )}

        {gameState.status === "waiting_for_next_question" &&
          !isLastQuestion && (
            <Button
              type="primary"
              onClick={() => {
                onNextQuestion();
                setIsClickEndQuestion(false);
              }}
            >
              Next Question
            </Button>
          )}

        {gameState.status === "waiting_for_next_question" && isLastQuestion && (
          <Button type="primary" onClick={onNextQuestion}>
            Finish Game
          </Button>
        )}

        <Button danger onClick={onForceEndGame}>
          Force End Game
        </Button>
      </div>
    </Card>
  );

  if (gameState.status === "finished") {
    const sortedPlayers = [...(gameState.players || [])].sort(
      (a, b) => b.score - a.score
    );

    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center">
            <Title level={2}>🎉 Game Finished!</Title>
            <Text>Final Results</Text>
          </div>
        </Card>

        <Card title="Final Leaderboard">
          <List
            dataSource={sortedPlayers}
            renderItem={(player, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <div className="flex items-center gap-2">
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
                      <Avatar src={player.avatar} icon={<UserOutlined />} />
                    </div>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{player.displayName}</span>
                      {index === 0 && <span>🏆</span>}
                      {index === 1 && <span>🥈</span>}
                      {index === 2 && <span>🥉</span>}
                    </div>
                  }
                  description={
                    <div>
                      <Text strong>Final Score: {player.score} points</Text>
                      <br />
                      <Text type="secondary">
                        Correct answers:{" "}
                        {player.answers.filter((a) => a.isCorrect).length} /{" "}
                        {player.answers.length}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderQuestionContent()}
      {renderAnswerStats()}
      {renderPlayerList()}
      {renderControls()}
    </div>
  );
}
