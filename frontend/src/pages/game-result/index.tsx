import { useParams } from "react-router-dom";
import { Row, Col, Spin, Alert } from "antd";
import useFetchData from "@/hooks/useFetchData";
import GameInfoHeader from "./_components/game-info-header";
import GameStats from "./_components/game-stats";
import Leaderboard from "./_components/leaderboard";
import AnswerHistory from "./_components/answer-history";

export default function GameResult() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useFetchData<GameSessionResponse>(
    `/game/session/${id}`,
    {
      type: "private",
      uniqueKey: [`/game/session/${id}`],
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          message="Error Loading Game Results"
          description={error.message || "Failed to load game session data"}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          message="Game Not Found"
          description="The requested game session could not be found"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Game Information Header */}
      <GameInfoHeader gameSession={data.gameSession} />

      <Row gutter={[24, 24]}>
        {/* Left Column - Stats and Leaderboard */}
        <Col xs={24} lg={12}>
          <GameStats
            totalAnswered={data.answers.length}
            statistics={data.statistics}
          />
          <Leaderboard
            leaderboard={data.leaderboard}
            currentPlayerId={data.gameSession.player._id}
          />
        </Col>

        {/* Right Column - Answer History */}
        <Col xs={24} lg={12}>
          <AnswerHistory answers={data.answers} />
        </Col>
      </Row>
    </div>
  );
}
