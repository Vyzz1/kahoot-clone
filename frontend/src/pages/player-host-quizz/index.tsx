import { useSocket } from "@/hooks/useSocket";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "antd";
import InforJoinForm from "./_components/infor-join-form";
import PlayerQuestion from "./_components/player-question";
import PlayerLeaderboard from "./_components/player-leaderboard";
import GameStatus from "./_components/GameStatus";
import QuestionResultsHeader from "./_components/question-results-header";
interface PlayerData {
  id: string;
  displayName: string;
  avatar: string;
}

type CurrentAnswerResult = {
  isCorrect?: boolean;
  pointsEarned?: number;
  totalScore?: number;
  correctAnswer: any;
  answerTime?: number;
};

export default function PlayerHostQuizzPage() {
  const [isJoined, setIsJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [params] = useSearchParams();
  const gameId = params.get("gameId");

  const shouldShowInforForm = !isJoined && isConnected;

  const [start, setStart] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [questionEndTime, setQuestionEndTime] = useState<Date | undefined>();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const [correctAnswer, setCorrectAnswer] = useState<CorrectAnswer>(undefined);

  const [currentAnswerResult, setCurrentAnswerResult] =
    useState<CurrentAnswerResult | null>(null);

  const socket = useSocket();

  const handleSubmitAnswer = (
    answerId: string,
    answerTime: number,
    answerData?: any
  ) => {
    if (socket && gameId) {
      console.log("Submitting answer:", {
        gameId,
        answerId,
        answerTime,
        answerData,
      });
      socket.emit("submitAnswer", { gameId, answerId, answerTime, answerData });
      setHasAnswered(true);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      console.log("Connected to socket server");
      if (
        gameId &&
        localStorage.getItem(`playerData-${gameId}`) &&
        socket.connected
      ) {
        console.log(" Rejoining game with stored player data");
        const playerData = JSON.parse(
          localStorage.getItem(`playerData-${gameId}`) || "{}"
        );
        setPlayerData(playerData);
        socket.emit("joinGame", { gameId, player: playerData });
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsJoined(false);
    };

    const handleJoinedGame = (data: any) => {
      setIsJoined(true);
      setIsJoining(false);
      localStorage.setItem(`playerData-${gameId}`, JSON.stringify(data.player));
      socket.emit("getGameState", { gameId });
    };

    const handleJoinGameError = (data: any) => {
      setIsJoining(false);
      message.error(data.error || "Failed to join game");
    };

    const handleGameUpdate = (data: any) => {
      console.log(" Game update received:", data);
      setGameState(data);
    };

    const handleGameStarted = (data: any) => {
      console.log(" Game started:", data);
      message.info("Game has started!");
      setStart(true);
      setCurrentQuestion(data.firstQuestion);
      setQuestionEndTime(new Date(data.questionEndTime));
      setHasAnswered(false);
      setLeaderboard([]);
    };

    const handleGameState = (data: any) => {
      console.log(" Game state update received:", data);
      setGameState(data);

      if (data.currentQuestionIndex >= 0) {
        setStart(true);
        setCurrentQuestion(data.currentQuestion);
        if (data.questionEndTime) {
          setQuestionEndTime(new Date(data.questionEndTime));
        }
        if (data.isCurrentQuestionEnded) {
          socket.emit("getLeaderboard", { gameId });
          socket.emit("getPreviousAnswerResult", { gameId });
        }

        if (data.correctAnswer) {
          setCorrectAnswer(data.correctAnswer);
        }
      }
    };

    const handleNextQuestionStarted = (data: any) => {
      setGameState((pre: any) => ({
        ...pre,
        isCurrentQuestionEnded: false,
      }));
      setCurrentQuestion(data.question);
      setQuestionEndTime(new Date(data.questionEndTime));
      setHasAnswered(false);
      setLeaderboard([]);

      message.info(`Question ${data.questionIndex + 1} started!`);
    };

    const handleAnswerSubmitted = (data: any) => {
      console.log(" Answer submitted confirmation:", data);
      setHasAnswered(true);
      message.success(`Answer submitted! `);
      setCurrentAnswerResult(data);
    };

    const handleAnswerError = (data: any) => {
      console.error(" Answer error:", data);
      message.error(data.error || "Failed to submit answer");
    };

    const handleQuestionEnded = (data: any) => {
      console.log(" Question ended:", data);
      setGameState((pre: any) => ({
        ...pre,
        isCurrentQuestionEnded: true,
      }));
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
      if (data.correctAnswer) {
        setCorrectAnswer(data.correctAnswer);
      }
      setHasAnswered(false);
    };

    const handleGameFinished = (data: any) => {
      console.log(" Game finished:", data);
      if (data.finalLeaderboard) {
        setLeaderboard(data.finalLeaderboard);
      }
      message.success("Game has finished!");
    };

    const handleHostDisconnected = (data: any) => {
      console.log(" Host disconnected:", data);

      message.error("Host has disconnected!");
    };

    const handleGetCurrentLeaderboard = (data: any) => {
      console.log(" Current leaderboard received:", data);
      setLeaderboard(data.leaderboard || []);
    };

    const handleGetPreviousAnswerResult = (data: any) => {
      console.log(" Previous answer result received:", data);
      setCurrentAnswerResult(data.answerResult || null);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("joinedGame", handleJoinedGame);
    socket.on("joinGameError", handleJoinGameError);
    socket.on("gameUpdate", handleGameUpdate);
    socket.on("gameStarted", handleGameStarted);
    socket.on("gameState", handleGameState);
    socket.on("nextQuestionStarted", handleNextQuestionStarted);
    socket.on("answerSubmitted", handleAnswerSubmitted);
    socket.on("answerError", handleAnswerError);
    socket.on("questionEnded", handleQuestionEnded);
    socket.on("gameFinished", handleGameFinished);
    socket.on("hostDisconnected", handleHostDisconnected);
    socket.on("currentLeaderboard", handleGetCurrentLeaderboard);
    socket.on("previousAnswerResult", handleGetPreviousAnswerResult);

    if (!socket.connected) {
      console.log(" Connecting to socket server...");
      socket.connect();
    } else {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("joinedGame", handleJoinedGame);
      socket.off("joinGameError", handleJoinGameError);
      socket.off("gameUpdate", handleGameUpdate);
      socket.off("gameStarted", handleGameStarted);
      socket.off("gameState", handleGameState);
      socket.off("nextQuestionStarted", handleNextQuestionStarted);
      socket.off("answerSubmitted", handleAnswerSubmitted);
      socket.off("answerError", handleAnswerError);
      socket.off("questionEnded", handleQuestionEnded);
      socket.off("gameFinished", handleGameFinished);
      socket.off("hostDisconnected", handleHostDisconnected);
    };
  }, [socket, gameId]);

  useEffect(() => {
    if (gameId && socket && isConnected) {
      console.log(" Requesting game state for gameId:", gameId);
      socket.emit("getGameState", { gameId });
    }
  }, [gameId, socket, isConnected]);

  const handleJoinGame = (formData: {
    displayName: string;
    avatar: string;
    id: string;
  }) => {
    console.log("Joining game with data:", formData);
    if (!gameId || !socket.connected) {
      message.error("Cannot join game. Please check your connection.");
      return;
    }

    setIsJoining(true);

    const player = {
      id: formData.id,
      displayName: formData.displayName,
      avatar: formData.avatar,
    };

    setPlayerData(player);

    console.log(" Joining game with:", { gameId, player });
    socket.emit("joinGame", { gameId, player });
  };

  const isEndedQuestion = gameState?.isCurrentQuestionEnded;

  return (
    <section className="px-4 py-8 min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        {!start && (
          <>
            <div className="text-center mb-8">
              <Title>Player Game Lobby</Title>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Connection: {isConnected ? "✅ Connected" : "❌ Disconnected"}
                </p>
                <p>Game ID: {gameId || "Not found"}</p>
                {playerData && <p>Player: {playerData.displayName}</p>}
              </div>
            </div>

            {shouldShowInforForm && (
              <InforJoinForm onSubmit={handleJoinGame} loading={isJoining} />
            )}

            {isJoined && gameState && (
              <div className="text-center">
                <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
                  <h2 className="text-xl font-semibold mb-4">
                    Waiting for Game to Start
                  </h2>
                  <div className="space-y-2">
                    <p>
                      <strong>Players:</strong> {gameState.players?.length || 0}
                    </p>
                    <p>
                      <strong>Status:</strong> {gameState.status || "Unknown"}
                    </p>
                    <p>
                      <strong>Current Question:</strong>{" "}
                      {gameState.currentQuestionIndex + 1}
                    </p>
                  </div>

                  {gameState.players && gameState.players.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Players in Game:</h3>
                      <div className="space-y-1">
                        {gameState.players.map((player: any) => (
                          <div key={player.id} className="text-sm">
                            {player.displayName} - Score: {player.score}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isConnected && (
              <div className="text-center">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  Connecting to game server...
                </div>
              </div>
            )}
          </>
        )}

        {start && currentQuestion && !isEndedQuestion && (
          <PlayerQuestion
            question={currentQuestion}
            questionIndex={gameState?.currentQuestionIndex || 0}
            totalQuestions={gameState?.totalQuestions || 0}
            questionEndTime={questionEndTime}
            onSubmitAnswer={handleSubmitAnswer}
            hasAnswered={hasAnswered}
            disabled={!isJoined || gameState?.isCurrentQuestionEnded}
          />
        )}

        {start && isEndedQuestion && (
          <div className="space-y-6">
            <QuestionResultsHeader
              questionIndex={gameState?.currentQuestionIndex}
            />
            <PlayerLeaderboard
              correctAnswer={correctAnswer}
              leaderboard={leaderboard}
              currentPlayer={playerData || undefined}
              gameState={gameState}
              currentQuestion={currentQuestion}
              currentAnswerResult={currentAnswerResult!}
            />
            <GameStatus
              gameState={gameState}
              isFinished={gameState?.status === "finished"}
            />
          </div>
        )}
      </div>
    </section>
  );
}
