import { Server } from "socket.io";
import http from "http";
import express from "express";
import { QuestionDocument } from "../models/question.model";
import { DocumentNotFoundError } from "../error/customError";
import GameModel from "../models/game.model";
import gameService from "../services/game.service";
import gameQueueService from "../services/gameQueue.service";
import jwt from "jsonwebtoken";
const app = express();

const server = http.createServer(app);

interface Player {
  id: string;
  displayName: string;
  score: number;
  avatar: string;
  answers: Array<{
    questionIndex: number;
    answerId: string;
    answerTime: number;
    isCorrect: boolean;
    pointsEarned: number;
  }>;
}

interface GameMap {
  players: Player[];
  currentQuestionIndex: number;
  currentQuestion: string;
  questionEndTime?: Date;
  isCurrentQuestionEnded: boolean;
  startedAt: Date;
  finishedAt?: Date;
  status: "waiting" | "in_progress" | "finished" | "waiting_for_next_question";
  hostId: string;
  quizId: string;
  questions: QuestionDocument[];
}

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});
const gameMap = new Map<string, GameMap>();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token as string;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    socket.data.user = decoded;
    socket.data.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(` User connected: ${socket.id}`);

  const userId = socket.data.userId;

  socket.on("initGame", async (data) => {
    console.log("Received initGame event");
    const { gameId } = data;

    const game = await GameModel.findById(gameId)
      .populate({
        path: "quiz",
        populate: {
          path: "questions",
          model: "Question",
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
      questions: populatedGame.quiz?.questions || [],
      questionEndTime: undefined,
      isCurrentQuestionEnded: false,
      startedAt: game.startedAt || new Date(),
      status: "waiting",
      hostId: game.host!.toString(),
      quizId: populatedGame.quiz?._id?.toString() || "",
    };

    gameMap.set(gameId, gameData);

    socket.join(gameId);

    console.log(`Game initialized with ID: ${gameId}`);
    socket.emit("gameInitialized", {
      gameId,
      totalQuestion: gameData.questions.length,
      pin: game.pin,
      players: gameData.players || [],
    });
  });

  socket.on("joinGame", async (data) => {
    const { gameId, player } = data;

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
          socket.emit("joinGameError", {
            error: "You are already in this game",
          });

          return;
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
  });

  socket.on("startGame", async (data) => {
    const { gameId } = data;

    try {
      if (!gameMap.has(gameId)) {
        throw new Error(`Game with ID ${gameId} does not exist.`);
      }

      const game = gameMap.get(gameId);

      if (game) {
        game.status = "in_progress";
        game.currentQuestionIndex = 0;
        game.currentQuestion = game.questions[0].content;
        game.questionEndTime = new Date(
          Date.now() + game.questions[0].timeLimit * 1000
        );
        game.isCurrentQuestionEnded = false;
        game.startedAt = new Date();

        console.log(
          `Game ${gameId} started with question: ${game.currentQuestion}`
        );

        io.to(gameId).emit("gameUpdate", game);
        io.to(gameId).emit("gameStarted", {
          gameId,
          firstQuestion: game.questions[0],
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
  });

  socket.on("submitAnswer", async (data) => {
    const { gameId, answerId, answerTime } = data;

    try {
      if (!gameMap.has(gameId)) {
        throw new Error(`Game with ID ${gameId} does not exist.`);
      }

      const game = gameMap.get(gameId);

      if (
        game &&
        game.status === "in_progress" &&
        !game.isCurrentQuestionEnded
      ) {
        const player = game.players.find((p) => p.id === userId);
        const currentQuestion = game.questions[game.currentQuestionIndex];

        if (player && currentQuestion) {
          const alreadyAnswered = player.answers.find(
            (a) => a.questionIndex === game.currentQuestionIndex
          );
          if (alreadyAnswered) {
            socket.emit("answerError", {
              error: "Already answered this question",
            });
            return;
          }

          const correctOption = currentQuestion.options?.find(
            (option) => option.isCorrect
          );
          const isCorrect =
            correctOption && correctOption._id?.toString() === answerId;

          let pointsEarned = 0;
          if (isCorrect) {
            const basePoints = currentQuestion.points || 1000;
            const timeLimit = currentQuestion.timeLimit;
            const timeBonus = Math.max(0, (timeLimit - answerTime) / timeLimit);
            pointsEarned = Math.round(basePoints * (0.5 + 0.5 * timeBonus));
          }

          const selectedOptionIndex = currentQuestion.options?.findIndex(
            (option) => option._id?.toString() === answerId
          );

          player.answers.push({
            questionIndex: game.currentQuestionIndex,
            answerId,
            answerTime,
            isCorrect: !!isCorrect,
            pointsEarned,
          });

          player.score += pointsEarned;

          console.log(
            `Player ${player.displayName} answered question ${
              game.currentQuestionIndex + 1
            }: ${isCorrect ? "Correct" : "Incorrect"} (+${pointsEarned} points)`
          );

          socket.emit("answerSubmitted", {
            questionIndex: game.currentQuestionIndex,
            isCorrect: !!isCorrect,
            pointsEarned,
            totalScore: player.score,
            correctAnswer: correctOption,
          });

          io.to(gameId).emit("playerAnswered", {
            playerId: userId,
            displayName: player.displayName,
            answered: true,
          });

          gameQueueService
            .addToQueue(
              "saveAnswer",
              {
                gameId,
                questionId: (currentQuestion as any)._id?.toString() || "",
                playerId: userId,
                answerId,
                responseTime: answerTime,
                pointsEarned,
                isCorrect: !!isCorrect,
                selectedOptionIndex,
              },
              1
            )
            .catch((error) => {
              console.error("Failed to queue answer save:", error);
            });
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      socket.emit("answerError", {
        error:
          error instanceof Error ? error.message : "Failed to submit answer",
      });
    }
  });

  socket.on("endQuestion", async (data) => {
    const { gameId } = data;

    if (!gameMap.has(gameId)) {
      throw new Error(`Game with ID ${gameId} does not exist.`);
    }

    const game = gameMap.get(gameId);
    if (game) {
      game.isCurrentQuestionEnded = true;
      game.status = "waiting_for_next_question";

      const leaderboard = game.players.map((player) => ({
        id: player.id,
        displayName: player.displayName,
        score: player.score,
        rank: 0,
        lastAnswerCorrect:
          player.answers.length > 0
            ? player.answers[player.answers.length - 1].isCorrect
            : false,
        lastPointsEarned:
          player.answers.length > 0
            ? player.answers[player.answers.length - 1].pointsEarned
            : 0,
      }));

      leaderboard.sort((a, b) => b.score - a.score);

      leaderboard.forEach((player, index) => {
        player.rank = index + 1;
      });

      const isLastQuestion =
        game.currentQuestionIndex >= game.questions.length - 1;

      console.log(
        `Question ${game.currentQuestionIndex + 1} ended for game ${gameId}`
      );

      io.to(gameId).emit("questionEnded", {
        gameId,
        currentQuestionIndex: game.currentQuestionIndex,
        leaderboard,
        isLastQuestion,
        correctAnswer: game.questions[game.currentQuestionIndex].options?.find(
          (opt) => opt.isCorrect
        ),
      });

      if (isLastQuestion) {
        game.status = "finished";
        game.finishedAt = new Date();
        console.log(`Game ${gameId} finished.`);

        gameQueueService
          .addToQueue("endGame", {
            gameId,
            hostId: game.hostId,
          })
          .catch((error) => {
            console.error("Failed to queue endGame:", error);
          });

        io.to(gameId).emit("gameFinished", {
          gameId,
          finalLeaderboard: leaderboard,
          game,
        });
      }

      io.to(gameId).emit("gameUpdate", game);
    }
  });

  socket.on("nextQuestion", (data) => {
    const { gameId } = data;

    if (!gameMap.has(gameId)) {
      throw new Error(`Game with ID ${gameId} does not exist.`);
    }

    const game = gameMap.get(gameId);

    if (game && game.status === "waiting_for_next_question") {
      game.currentQuestionIndex++;

      if (game.currentQuestionIndex < game.questions.length) {
        const nextQuestion = game.questions[game.currentQuestionIndex];

        game.currentQuestion = nextQuestion.content;
        game.questionEndTime = new Date(
          Date.now() + nextQuestion.timeLimit * 1000
        );
        game.isCurrentQuestionEnded = false;
        game.status = "in_progress";

        console.log(
          `Moving to question ${
            game.currentQuestionIndex + 1
          } for game ${gameId}`
        );

        io.to(gameId).emit("nextQuestionStarted", {
          gameId,
          questionIndex: game.currentQuestionIndex,
          question: nextQuestion,
          questionEndTime: game.questionEndTime,
        });

        io.to(gameId).emit("gameUpdate", game);
      } else {
        game.status = "finished";
        game.finishedAt = new Date();

        io.to(gameId).emit("gameFinished", {
          gameId,
          game,
        });
      }
    }
  });

  socket.on("getLeaderboard", (data) => {
    const { gameId } = data;

    if (!gameMap.has(gameId)) {
      throw new Error(`Game with ID ${gameId} does not exist.`);
    }

    const game = gameMap.get(gameId);

    if (game) {
      const leaderboard = game.players.map((player) => ({
        id: player.id,
        displayName: player.displayName,
        score: player.score,
        rank: 0,
      }));

      leaderboard.sort((a, b) => b.score - a.score);

      leaderboard.forEach((player, index) => {
        player.rank = index + 1;
      });

      socket.emit("currentLeaderboard", {
        gameId,
        leaderboard,
        currentQuestionIndex: game.currentQuestionIndex,
      });
    }
  });

  socket.on("getGameStats", async (data) => {
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
  });

  socket.on("forceEndGame", async (data) => {
    const { gameId, hostId } = data;

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
      socket.emit("forceEndGameError", {
        error: error instanceof Error ? error.message : "Failed to end game",
      });
    }
  });

  socket.on("disconnect", async () => {
    const userId = socket.data.userId;
    const user = socket.data.user;
    console.log(
      `User disconnected: ${user?.username || "Unknown"} (ID: ${userId})`
    );

    const socketRooms = Array.from(socket.rooms);

    for (const room of socketRooms) {
      if (room !== socket.id && gameMap.has(room)) {
        const game = gameMap.get(room);
        if (game) {
          const playerIndex = game.players.findIndex((p) => p.id === userId);
          if (playerIndex !== -1) {
            const player = game.players[playerIndex];
            game.players.splice(playerIndex, 1);

            console.log(
              `Player ${player.displayName} removed from game ${room}`
            );

            io.to(room).emit("playerDisconnected", {
              playerId: userId,
              displayName: player.displayName,
              gameId: room,
            });

            io.to(room).emit("gameUpdate", game);

            gameQueueService
              .addToQueue("removePlayer", {
                gameId: room,
                playerId: userId,
              })
              .catch((error) => {
                console.error("Failed to queue player removal:", error);
              });
          }
        }
      }
    }
  });
});

export { app, server, io };
