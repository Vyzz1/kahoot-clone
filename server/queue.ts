import { Queue } from "bullmq";
import loadEnv from "./config/env";

loadEnv();

export const gameQueue = new Queue("gameQueue", {
  connection: {
    port: 6379,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    tls: {},
  },
});
