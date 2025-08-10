import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import {
  handleInitGame,
  handleJoinGame,
  handleStartGame,
  handleForceEndGame,
  handleGetGameStats,
} from "./handlers/game.handlers";
import {
  handleEndQuestion,
  handleNextQuestion,
} from "./handlers/question.handlers";
import {
  handleSubmitAnswer,
  handleGetPreviousAnswerResult,
} from "./handlers/answer.handlers";
import {
  handleGetGameState,
  handleGetLeaderboard,
} from "./handlers/utility.handlers";
import { handleDisconnect } from "./handlers/disconnect.handlers";

export interface GameSocketHandlers {
  socket: Socket;
  io: Server;
  gameMap: Map<string, GameMap>;
  questionsMap: Map<string, any[]>;
}

const app = express();

const server = http.createServer(app);

const io: Server = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

const gameMap = new Map<string, GameMap>();

const questionsMap = new Map<string, any[]>();

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

  const handlersArgs: GameSocketHandlers = {
    socket,
    io,
    gameMap,
    questionsMap,
  };

  // Game handlers
  socket.on("initGame", handleInitGame(handlersArgs));
  socket.on("joinGame", handleJoinGame(handlersArgs));
  socket.on("startGame", handleStartGame(handlersArgs));
  socket.on("forceEndGame", handleForceEndGame(handlersArgs));
  socket.on("getGameStats", handleGetGameStats(handlersArgs));

  // Question handlers
  socket.on("endQuestion", handleEndQuestion(handlersArgs));
  socket.on("nextQuestion", handleNextQuestion(handlersArgs));

  // Answer handlers
  socket.on("submitAnswer", handleSubmitAnswer(handlersArgs));
  socket.on(
    "getPreviousAnswerResult",
    handleGetPreviousAnswerResult(handlersArgs)
  );

  // Utility handlers
  socket.on("getGameState", handleGetGameState(handlersArgs));
  socket.on("getLeaderboard", handleGetLeaderboard(handlersArgs));

  // Disconnect handler
  socket.on("disconnect", handleDisconnect(handlersArgs));
});

export { app, server, io };
