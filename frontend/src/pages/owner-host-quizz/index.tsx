import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "antd";
import GameSettingsModal from "./_components/game-settings-modal";
import GameView from "./_components/game-view";

function OwnerHostQuizzPage() {
  const [isInitGame, setIsInitGame] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [pin, setPin] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasInitError, setHasInitError] = useState(false);
  const [params] = useSearchParams();
  const socket = useSocket();
  const [gameState, setGameState] = useState<any>();

  const [currentQuestion, setCurrentQuestion] = useState<any>(null);

  const [start, setStart] = useState(false);

  const players = gameState?.players || [];

  const shouldShowWaiting = isInitialized && isConnected;

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("Connected to socket server");
      setIsConnected(true);
    };

    const handleGameInitialized = (data: any) => {
      console.log("Game Initialized:", data);

      setIsInitGame(true);
      setIsInitialized(true);
      setHasInitError(false);
      setTotalQuestion(data.totalQuestion);
      setPin(data.pin);
    };

    const handleInitGameError = (data: any) => {
      console.error("Init game error:", data);
      message.error(data.error || "Failed to initialize game");
      setIsInitGame(false);
      setIsInitialized(false);
      setHasInitError(true);
    };

    const handleDisconnect = () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
      setIsInitGame(false);
    };

    const handleGameStarted = (data: any) => {
      console.log("Game started:", data);
      setStart(true);
      setCurrentQuestion(data.firstQuestion);
      message.info("Game has started!");
    };

    const handlePlayerDisconnected = (data: any) => {
      console.log("Player disconnected:", data);

      // Show notification
      message.warning(`Player ${data.displayName} has disconnected`);

      // Update game state with the remaining players
      setGameState((prev: any) => ({
        ...prev,
        players:
          prev?.players?.filter((p: any) => p.id !== data.playerId) || [],
      }));
    };

    const handleQuestionEnded = (data: any) => {
      console.log("Question ended:", data);
      setGameState({
        ...data,
        players: data.players || [],
      });
      message.info(`Question ${data.currentQuestionIndex + 1} ended!`);
    };

    const handleGameFinished = (data: any) => {
      console.log("Game finished:", data);
      setGameState((prev: any) => ({
        ...prev,
        status: "finished",
      }));
      message.success("Game has finished!");
    };

    const handleGameForceEnded = (data: any) => {
      console.log("Game force ended:", data);
      setGameState((prev: any) => ({
        ...prev,
        status: "finished",
      }));
      message.warning("Game has been forcefully ended!");
    };

    const handlePlayerAnswered = (data: any) => {
      console.log("Player answered:", data);
    };

    const handleHostDisconnected = (data: any) => {
      console.log("Host disconnected:", data);
      message.error("Host has disconnected from the game");
    };

    const handleGamePaused = (data: any) => {
      console.log("Game paused:", data);
      message.warning(data.message || "Game has been paused");
      setGameState((prev: any) => ({
        ...prev,
        status: "waiting",
      }));
      setStart(false);
    };

    const handleNextQuestionStarted = (data: any) => {
      console.log("Next question started:", data);
      setCurrentQuestion(data.question);
      setGameState((prev: any) => ({
        ...prev,
        currentQuestionIndex: data.questionIndex,
        questionEndTime: data.questionEndTime,
        isCurrentQuestionEnded: false,
        status: "in_progress",
      }));
    };

    const handleAlreadyInitialized = (data: any) => {
      console.log("Game already initialized:", data);

      if (data.currentQuestionIndex >= 0) {
        setStart(true);
        setCurrentQuestion(data.currentQuestion);
      }

      setGameState({
        ...data,
        players: data.players || [],
      });
      setTotalQuestion(data.totalQuestion);
      setIsInitialized(true);
      setHasInitError(false);
      setPin((prevPin) => data.pin || prevPin);

      if (
        data.status === "in_progress" &&
        !data.isCurrentQuestionEnded &&
        data.questionEndTime
      ) {
        console.log("Resuming timer for current question");
      }

      message.info("Reconnected to existing game");
    };

    socket.on("connect", handleConnect);
    socket.on("gameInitialized", handleGameInitialized);
    socket.on("initGameError", handleInitGameError);
    socket.on("disconnect", handleDisconnect);
    socket.on("gameUpdate", (data) => {
      console.log("Game update received:", data);
      setGameState({
        ...data,
        players: data.players || [],
      });
    });

    socket.on("gameAlreadyInitialized", handleAlreadyInitialized);

    socket.on("gameStarted", handleGameStarted);
    socket.on("playerDisconnected", handlePlayerDisconnected);
    socket.on("hostDisconnected", handleHostDisconnected);
    socket.on("gamePaused", handleGamePaused);
    socket.on("questionEnded", handleQuestionEnded);
    socket.on("gameFinished", handleGameFinished);
    socket.on("playerAnswered", handlePlayerAnswered);
    socket.on("nextQuestionStarted", handleNextQuestionStarted);

    socket.on("gameForceEnded", handleGameForceEnded);

    if (!socket.connected) {
      console.log("Connecting to socket server...");
      socket.connect();
    } else {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("gameInitialized", handleGameInitialized);
      socket.off("initGameError", handleInitGameError);
      socket.off("disconnect", handleDisconnect);
      socket.off("gameUpdate");
      socket.off("gameState");
      socket.off("gameStarted", handleGameStarted);
      socket.off("playerDisconnected", handlePlayerDisconnected);
      socket.off("hostDisconnected", handleHostDisconnected);
      socket.off("gamePaused", handleGamePaused);
      socket.off("questionEnded", handleQuestionEnded);
      socket.off("gameFinished", handleGameFinished);
      socket.off("playerAnswered", handlePlayerAnswered);
      socket.off("nextQuestionStarted", handleNextQuestionStarted);
      socket.off("gameAlreadyInitialized", handleAlreadyInitialized);
      socket.off("gameForceEnded", handleGameForceEnded);
    };
  }, [socket, params]);

  useEffect(() => {
    if (
      isConnected &&
      !isInitGame &&
      socket &&
      params.get("gameId") &&
      !hasInitError
    ) {
      console.log("Initializing game with ID:", params.get("gameId"));
      socket.emit("initGame", { gameId: params.get("gameId") });
      setIsInitGame(true);
    }
  }, [isConnected, isInitGame, socket, params, hasInitError]);

  // useEffect(() => {
  //   if (!socket || !start || !params.get("gameId")) return;

  //   const interval = setInterval(() => {
  //     // socket.emit("getGameState", { gameId: params.get("gameId") });
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [socket, start, params]);

  const handleStartGame = () => {
    if (socket && params.get("gameId")) {
      console.log(" Starting game...");

      const gameId = params.get("gameId")!;

      socket.emit("startGame", {
        gameId: gameId,
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4"> Owner Host Quiz</h1>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="p-3 bg-gray-50 rounded">
            <strong>Connection:</strong>{" "}
            {isConnected ? " Connected" : " Disconnected"}
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <strong>Game Status:</strong>{" "}
            {isInitGame ? " Initialized" : " Not Initialized"}
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <strong>Game ID:</strong> {params.get("gameId") || "Not found"}
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <strong>Game PIN:</strong> {pin || "Not available"}
          </div>
        </div>
      </div>

      {shouldShowWaiting && !start && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Game Information</h2>
              <div className="flex gap-3">
                <GameSettingsModal
                  gameId={params.get("gameId") || ""}
                  disabled={players.length === 0 && !isInitGame}
                />
                <button
                  onClick={handleStartGame}
                  disabled={players.length === 0}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    players.length > 0
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Start Game ({players.length} players)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {totalQuestion}
                </div>
                <div className="text-sm text-blue-800">Total Questions</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {players.length}
                </div>
                <div className="text-sm text-green-800">Players Joined</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{pin}</div>
                <div className="text-sm text-purple-800">Game PIN</div>
              </div>
            </div>
          </div>

          {players.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                Players in Lobby ({players.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      <img
                        src={p.avatar || "/default-avatar.png"}
                        alt="Avatar"
                        className="w-full h-full rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{p.displayName}</div>
                      <div className="text-xs text-gray-500">
                        ID: {p.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {players.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-yellow-800">
                <h3 className="font-medium mb-2">Waiting for Players</h3>
                <p className="text-sm">
                  Share the Game PIN <strong>{pin}</strong> with players to
                  join!
                </p>
                <p className="text-xs mt-1">
                  Players can join at: <strong>/join-game</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!shouldShowWaiting && !hasInitError && (
        <div className="text-center py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-blue-800">
              {!isConnected
                ? "Connecting to server..."
                : "Initializing game..."}
            </div>
          </div>
        </div>
      )}

      {hasInitError && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800">
              <h3 className="font-medium mb-2">Game Initialization Failed</h3>
              <p className="text-sm mb-4">
                You are not authorized to host this game or the game doesn't
              </p>
            </div>
          </div>
        </div>
      )}

      {start && gameState && (
        <GameView
          gameId={params.get("gameId") as string}
          currentQuestion={currentQuestion}
          gameState={{
            ...gameState,
            players: gameState.players || [],
            totalQuestions: totalQuestion,
            questionEndTime: gameState.questionEndTime
              ? new Date(gameState.questionEndTime)
              : undefined,
          }}
          onNextQuestion={() => {
            if (socket && params.get("gameId")) {
              socket.emit("nextQuestion", { gameId: params.get("gameId") });
            }
          }}
          onEndQuestion={() => {
            if (socket && params.get("gameId")) {
              socket.emit("endQuestion", { gameId: params.get("gameId") });
            }
          }}
          onForceEndGame={() => {
            if (socket && params.get("gameId")) {
              socket.emit("forceEndGame", {
                gameId: params.get("gameId"),
              });
            }
          }}
        />
      )}
    </div>
  );
}

export default OwnerHostQuizzPage;
