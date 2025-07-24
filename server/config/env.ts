import dotenv from "dotenv";

import path from "path";

const MODE = process.env.NODE_ENV || "development";

const loadEnv = () => {
  console.log(`Loading environment variables for ${MODE} mode...`);
  dotenv.config({
    path: path.resolve(__dirname, `../.env.${MODE.toLowerCase()}`),
  });
};

export const isProduction = MODE.toLowerCase() === "production";
export const isDevelopment = MODE.toLowerCase() === "development";
export const isStaging = MODE.toLowerCase() === "staging";

export default loadEnv;
