import { Redis } from "@upstash/redis";
import loadEnv from "./config/env";
loadEnv();
const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_PASSWORD,
});

export default redis;
