import { useSocket } from "@/hooks/useSocket";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { message } from "antd";
import InforJoinForm from "./_components/infor-join-form";

interface PlayerData {
  id: string;
  displayName: string;
  avatar: string;
}

export default function PlayerHostQuizzPage() {
  const [isJoined, setIsJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [params] = useSearchParams();
  
  const gameId = params.get("gameId");
  

  const shouldShowInforForm = !isJoined && isConnected;

  const socket = useSocket();
  const navigate = useNavigate(); // Khởi tạo navigate

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsJoined(false);
    };

    const handleJoinedGame = (data: any) => {
      setIsJoined(true);
      setIsJoining(false);
      message.success(`Welcome to the game, ${data.player.displayName}!`);
    };

    const handleJoinGameError = (data: any) => {
      setIsJoining(false);
      message.error(data.error || "Failed to join game");
    };

    const handleGameUpdate = (data: any) => {
      setGameState(data);
    };

    const handleGameStarted = (data: any) => {
      console.log(" Game started:", data);
      message.info("Game has started!");
      if (gameId) {
        navigate(`quiz/play/${gameId}`);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("joinedGame", handleJoinedGame);
    socket.on("joinGameError", handleJoinGameError);
    socket.on("gameUpdate", handleGameUpdate);
    socket.on("gameStarted", handleGameStarted);

    if (!socket.connected) {
      console.log("🔌 Connecting to socket server...");
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
    };
  }, [socket, gameId, navigate]); // Thêm navigate và gameId vào dependency array

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

  return (
    <section className="px-4 py-8 min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Title>Player Game Lobby</Title>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Connection: {isConnected ? " Connected" : "❌ Disconnected"}</p>
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
                {typeof gameState.currentQuestionIndex === "number"
                  ? gameState.currentQuestionIndex + 1
                  : "N/A"}
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
      </div>
    </section>
  );
}