import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import connectToDB from "./utils/connect";
import userRouter from "./routes/user.route";
import errorHandler from "./middlewares/errorHandler";
import authRouter from "./routes/auth.route";
import corsHandler from "./config/corsHandler";
import quizRouter from "./routes/quiz.route";
import questionRouter from "./routes/question.route";
import migrationRouter from "./routes/migration.route";
import loadEnv, { isProduction } from "./config/env";
import loadSwaggerDocs, { openSwaggerDocs } from "./docs/step-up";
import { exit } from "node:process";
import gameQueueService from "./services/gameQueue.service";

loadEnv();

import "./processors/gamePersistenceProcessor";

import { server, app } from "./lib/socket";
import gameRouter from "./routes/game.route";
app.use(corsHandler);
app.use(compression({ threshold: 1024 }));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/questions", questionRouter);
app.use("/api/migrate", migrationRouter);
app.use("/api/game", gameRouter);
app.get("/api/queue/health", async (req, res) => {
  try {
    const health = await gameQueueService.getQueueHealth();
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      queue: health,
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT as string;

server.listen(PORT, async () => {
  try {
    await connectToDB();
    console.log(`Server is running on port ${PORT}`);

    if (!isProduction) {
      loadSwaggerDocs(app);
      openSwaggerDocs(PORT);
    }
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    exit(1);
  }
});
