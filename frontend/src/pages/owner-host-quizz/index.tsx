import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { message } from "antd";

function OwnerHostQuizzPage() {
  const [isInitGame, setIsInitGame] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [pin, setPin] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasInitError, setHasInitError] = useState(false);
  const [params] = useSearchParams();
  const socket = useSocket();

  const [player, setPlayer] = useState<
    { id: string; displayName: string; avatar: string | null }[]
  >([]);

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
      setPlayer(data.players || []);
      setPin(data.pin);
    };

    const handleInitGameError = (data: any) => {
      console.error("❌ Init game error:", data);
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
    };

    const handlePlayerDisconnected = (data: any) => {
      console.log(" Player disconnected:", data);
      setPlayer((prev) => prev.filter((p) => p.id !== data.playerId));
    };

    socket.on("connect", handleConnect);
    socket.on("gameInitialized", handleGameInitialized);
    socket.on("initGameError", handleInitGameError);
    socket.on("disconnect", handleDisconnect);
    socket.on("gameUpdate", (data) => {
      console.log("Game Update received:", data);
      setPlayer(data.players || []);
    });
    socket.on("gameStarted", handleGameStarted);
    socket.on("playerDisconnected", handlePlayerDisconnected);

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
      socket.off("gameStarted", handleGameStarted);
      socket.off("playerDisconnected", handlePlayerDisconnected);
    };
  }, [socket]);

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

  const handleStartGame = () => {
    if (socket && params.get("gameId")) {
      console.log(" Starting game...");
      socket.emit("startGame", {
        gameId: params.get("gameId"),
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">🎮 Owner Host Quiz</h1>

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

      {shouldShowWaiting && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Game Information</h2>
              <button
                onClick={handleStartGame}
                disabled={player.length === 0}
                className={`px-6 py-2 rounded-lg font-medium ${
                  player.length > 0
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Start Game ({player.length} players)
              </button>
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
                  {player.length}
                </div>
                <div className="text-sm text-green-800">Players Joined</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{pin}</div>
                <div className="text-sm text-purple-800">Game PIN</div>
              </div>
            </div>
          </div>

          {player.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                Players in Lobby ({player.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {player.map((p) => (
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

          {player.length === 0 && (
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
                ? "🔌 Connecting to server..."
                : "🎯 Initializing game..."}
            </div>
          </div>
        </div>
      )}

      {hasInitError && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800">
              <h3 className="font-medium mb-2">
                ❌ Game Initialization Failed
              </h3>
              <p className="text-sm mb-4">
                You are not authorized to host this game or the game doesn't
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerHostQuizzPage;
