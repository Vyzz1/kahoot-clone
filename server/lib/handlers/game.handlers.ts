import { Server, Socket } from "socket.io";
import { DocumentNotFoundError } from "../../error/customError";
import GameModel from "../../models/game.model";
import gameService from "../../services/gamePersist.service";
import gameQueueService from "../../services/gameQueue.service";
import { mapQuestionToNoAns } from "../../utils/mapper";
import { GameSocketHandlers } from "../socket";

export const handleInitGame = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return async (data: any) => {
    console.log("Received initGame event");
    const { gameId } = data;
    const userId = socket.data.userId;

    if (gameMap.has(gameId)) {
      console.log(`Game with ID ${gameId} already initialized.`);

      const findGame = gameMap.get(gameId);

      if (!findGame) {
        console.error(`Game with ID ${gameId} not found in gameMap.`);
        socket.emit("initGameError", {
          error: `Game with ID ${gameId} does not exist.`,
        });
        return;
      }

      if (findGame?.hostId !== userId) {
        console.error("Unauthorized access to initGame");
        socket.emit("initGameError", {
          error: "You are not authorized to initialize this game",
        });
        return;
      }

      const findQuestion =
        questionsMap.get(gameId)?.[
          findGame!.currentQuestionIndex >= 0
            ? findGame!.currentQuestionIndex
            : 0
        ];

      const currentQuestion = mapQuestionToNoAns(findQuestion);

      let updatedGameState = { ...findGame };
      if (
        findGame.status === "in_progress" &&
        !findGame.isCurrentQuestionEnded
      ) {
        const now = new Date();
        const endTime = findGame.questionEndTime
          ? new Date(findGame.questionEndTime)
          : null;

        if (endTime && now < endTime) {
          updatedGameState.questionEndTime = findGame.questionEndTime;
        } else if (endTime && now >= endTime) {
          updatedGameState.isCurrentQuestionEnded = true;
          updatedGameState.status = "waiting_for_next_question";
          gameMap.set(gameId, updatedGameState);
        }
      }

      const gameData = await GameModel.findById(gameId).select("pin").exec();

      socket.emit("gameAlreadyInitialized", {
        ...updatedGameState,
        currentQuestion,
        totalQuestion: questionsMap.get(gameId)?.length || 0,
        pin: gameData?.pin,
      });

      socket.join(gameId);

      console.log(`Socket rooms:`, Array.from(socket.rooms));

      return;
    }

    const game = await GameModel.findById(gameId)
      .populate({
        path: "quiz",
        populate: {
          path: "questions",
          model: "Question",
          select: "-v ",
        },
      })
      .exec();

    if (game?.host?.toString() !== userId) {
      console.error("Unauthorized access to initGame");
      socket.emit("initGameError", {
        error: "You are not authorized to initialize this game",
      });
      return;
    }

    if (!game) {
      throw new DocumentNotFoundError(`Game with ID ${gameId} does not exist.`);
    }

    const populatedGame = game as any;

    const gameData: GameMap = {
      players: [],
      currentQuestionIndex: -1,
      currentQuestion: "",
      questionEndTime: undefined,
      isCurrentQuestionEnded: false,
      startedAt: game.startedAt || new Date(),
      status: "waiting",
      hostId: game.host!.toString(),
      quizId: populatedGame.quiz?._id?.toString() || "",
      totalQuestions: populatedGame.quiz?.questions?.length || 0,
    };

    gameMap.set(gameId, gameData);

    questionsMap.set(gameId, populatedGame.quiz?.questions || []);

    socket.join(gameId);

    socket.emit("gameInitialized", {
      gameId,
      players: gameMap.get(gameId)?.players || [],
      totalQuestion: questionsMap.get(gameId)?.length || 0,
      pin: game.pin,
    });
  };
};

export const handleJoinGame = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return async (data: any) => {
    const { gameId, player } = data;
    const userId = socket.data.userId;

    try {
      if (!gameMap.has(gameId)) {
        throw new Error(`Game with ID ${gameId} does not exist.`);
      }

      const game = gameMap.get(gameId);
      if (game) {
        if (!game.players.some((p) => p.id === userId)) {
          const newPlayer: Player = {
            id: userId,
            displayName: player.displayName,
            score: 0,
            answers: [],
            avatar: player.avatar,
          };
          game.players.push(newPlayer);
        } else {
          console.log(`Player ${player.displayName} already in game ${gameId}`);

          socket.emit("joinedGame", {
            gameId,
            player: game.players.find((p) => p.id === userId),
            success: true,
          });
        }

        socket.join(gameId);

        console.log(`Player ${player.displayName} joined game ${gameId}`);

        io.to(gameId).emit("gameUpdate", game);

        socket.emit("joinedGame", {
          gameId,
          player: player,
          success: true,
        });

        gameQueueService
          .addToQueue("joinGame", {
            gameId,
            playerId: userId,
            displayName: player.displayName,
          })
          .catch((error) => {
            console.error("Failed to queue joinGame:", error);
          });
      }
    } catch (error) {
      console.error("Error joining game:", error);
      socket.emit("joinGameError", {
        error: error instanceof Error ? error.message : "Failed to join game",
      });
    }
  };
};

export const handleStartGame = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return async (data: any) => {
    const { gameId } = data;
    const userId = socket.data.userId;

    try {
      if (!gameMap.has(gameId)) {
        throw new Error(`Game with ID ${gameId} does not exist.`);
      }

      const game = gameMap.get(gameId);

      const findQuestions = questionsMap.get(gameId)?.[0];

      console.log(findQuestions);
      const firstQuestion = mapQuestionToNoAns(findQuestions);

      if (game) {
        game.status = "in_progress";
        game.currentQuestionIndex = 0;
        game.currentQuestion = firstQuestion?.content || "";
        game.questionEndTime = new Date(
          Date.now() + firstQuestion?.timeLimit! * 1000
        );
        game.isCurrentQuestionEnded = false;
        game.startedAt = new Date();

        console.log(
          `Game ${gameId} started with question: ${game.currentQuestion}`
        );

        io.to(gameId).emit("gameUpdate", game);

        io.to(gameId).emit("gameStarted", {
          gameId,
          firstQuestion: firstQuestion,
          questionEndTime: game.questionEndTime,
        });

        gameQueueService
          .addToQueue("startGame", {
            gameId,
            hostId: userId,
          })
          .catch((error) => {
            console.error("Failed to queue startGame:", error);
          });
      }
    } catch (error) {
      console.error("Error starting game:", error);
      socket.emit("startGameError", {
        error: error instanceof Error ? error.message : "Failed to start game",
      });
    }
  };
};

export const handleForceEndGame = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return async (data: any) => {
    const hostId = socket.data.userId;
    const { gameId } = data;

    try {
      const game = gameMap.get(gameId);
      if (game) {
        game.status = "finished";
        game.finishedAt = new Date();

        const leaderboard = game.players.map((player) => ({
          id: player.id,
          displayName: player.displayName,
          score: player.score,
          rank: 0,
          avatar: player.avatar || "",
        }));

        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.forEach((player, index) => {
          player.rank = index + 1;
        });

        io.to(gameId).emit("gameForceEnded", {
          gameId,
          finalLeaderboard: leaderboard,
          reason: "Host ended the game",
        });

        gameQueueService
          .addToQueue("endGame", {
            gameId,
            hostId,
          })
          .catch((error) => {
            console.error("Failed to queue forceEndGame:", error);
          });
      }
    } catch (error) {
      console.error("Error force ending game:", error);
    }
  };
};

export const handleGetGameStats = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return async (data: any) => {
    const { gameId } = data;

    try {
      const stats = await gameService.getGameStats(gameId);
      socket.emit("gameStats", stats);
    } catch (error) {
      console.error("Error getting game stats:", error);
      socket.emit("gameStatsError", {
        error:
          error instanceof Error ? error.message : "Failed to get game stats",
      });
    }
  };
};
