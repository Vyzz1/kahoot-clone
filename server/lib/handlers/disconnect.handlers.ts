import { Server, Socket } from "socket.io";
import gameQueueService from "../../services/gameQueue.service";
import { GameSocketHandlers } from "../socket";

export const handleDisconnect = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return async () => {
    const userId = socket.data.userId;
    const user = socket.data.user;
    console.log(
      `User disconnected: ${user?.username || "Unknown"} (ID: ${userId})`
    );

    for (const [gameId, game] of gameMap.entries()) {
      console.log(`Checking game: ${gameId} for userId: ${userId}`);

      const playerIndex = game.players.findIndex((p) => p.id === userId);
      if (playerIndex !== -1) {
        const player = game.players[playerIndex];

        console.log(
          `Player ${player.displayName} disconnected from game ${gameId}`
        );

        io.to(gameId).emit("playerDisconnected", {
          playerId: userId,
          displayName: player.displayName,
          gameId: gameId,
          players: game.players,
        });

        // game.players.splice(playerIndex, 1);

        console.log(
          `Player ${player.displayName} removed from game ${gameId}. Remaining players: ${game.players.length}`
        );

        if (game.players.length === 0 && game.status !== "finished") {
          console.log(`No players remaining in game ${gameId}. Pausing game.`);

          if (game.status === "in_progress") {
            game.status = "waiting";
            io.to(gameId).emit("gamePaused", {
              gameId: gameId,
              reason: "No players remaining",
              message: "Game paused - waiting for players to rejoin",
            });
          }
        }

        // io.to(gameId).emit("gameUpdate", game);

        gameQueueService
          .addToQueue("removePlayer", {
            gameId: gameId,
            playerId: userId,
            displayName: player.displayName,
          })
          .catch((error) => {
            console.error("Failed to queue player removal:", error);
          });
      } else if (game.hostId === userId) {
        console.log(`Host disconnected from game ${gameId}`);

        io.to(gameId).emit("hostDisconnected", {
          gameId: gameId,
          message: "Host has disconnected from the game",
        });
      }
    }
  };
};
