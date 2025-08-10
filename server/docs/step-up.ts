import fs from "fs";
import yaml from "yaml";

import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { exec } from "child_process";
import os from "os";
const file = fs.readFileSync("./docs/swagger-docs.yaml", "utf8");

const swaggerDocument = yaml.parse(file);

function loadSwaggerDocs(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

export function openSwaggerDocs(port: string) {
  const url = `http://localhost:${port}/api-docs`;

  const platform = os.platform();
  const command =
    platform === "win32"
      ? `start ${url}`
      : platform === "darwin"
      ? `open ${url}`
      : `xdg-open ${url}`;

  exec(command, (error) => {
    if (error) {
      console.error("Failed to open browser:", error);
    }
  });
}

export default loadSwaggerDocs;
