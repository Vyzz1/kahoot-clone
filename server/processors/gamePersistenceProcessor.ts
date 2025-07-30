import { Worker } from "bullmq";
import gameService from "../services/game.service";
import loadEnv from "../config/env";

loadEnv();
const connectionConfig = {
  port: 6379,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  tls: {},
};

console.log("🔧 Initializing game workers with Redis config:", {
  host: process.env.REDIS_HOST,
  port: 6379,
  hasPassword: !!process.env.REDIS_PASSWORD,
});

const gameWorker = new Worker(
  "gameQueue",
  async (job) => {
    console.log(`Processing ${job.name} job ${job.id}`);

    try {
      switch (job.name) {
        case "joinGame": {
          const { gameId, playerId, displayName } = job.data;
          console.log("Play id", playerId);
          console.log(`Join game: ${displayName} -> ${gameId}`);
          const result = await gameService.addPlayerToGame(
            gameId,
            playerId,
            displayName
          );
          console.log(`Join game successful: ${displayName} -> ${gameId}`);
          return result;
        }

        case "startGame": {
          const { gameId, hostId } = job.data;
          console.log(`Start game: ${gameId}`);
          const result = await gameService.startGame(gameId, hostId);
          console.log(`Start game successful: ${gameId}`);
          return result;
        }

        case "saveAnswer": {
          const answerData = job.data;
          console.log(`Save answer: ${answerData.playerId}`);
          const result = await gameService.savePlayerAnswer(answerData);
          console.log(` Save answer successful: ${answerData.playerId}`);
          return result;
        }

        case "endGame": {
          const { gameId, hostId } = job.data;
          console.log(`End game: ${gameId}`);
          const result = await gameService.endGame(gameId, hostId);
          console.log(`End game successful: ${gameId}`);
          return result;
        }

        case "removePlayer": {
          const { gameId, playerId } = job.data;
          console.log(`Remove player: ${playerId} from ${gameId}`);
          const result = await gameService.removePlayerFromGame(
            gameId,
            playerId
          );
          console.log(` Remove player successful: ${playerId}`);
          return result;
        }

        default:
          console.warn(` Unknown job type: ${job.name}`);
          return null;
      }
    } catch (error) {
      console.error(` Job ${job.name} failed:`, error);
      throw error;
    }
  },
  {
    connection: connectionConfig,
    concurrency: 10,
  }
);

[gameWorker].forEach((worker) => {
  worker.on("completed", (job) => {
    console.log(`Job ${job.id} (${job.name}) completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(` Job ${job?.id} (${job?.name}) failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err);
  });

  worker.on("ready", () => {
    console.log(" Game worker is ready and waiting for jobs");
  });
});

process.on("SIGTERM", async () => {
  console.log("Shutting down workers...");
  await gameWorker.close();
  console.log("Workers shut down successfully");
});

export default {
  gameWorker,
};
