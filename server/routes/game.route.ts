import { Router } from "express";
import validateJWT from "../middlewares/validate-jwt";
import gameController from "../controllers/game.controller";
import validateSchema from "../middlewares/validate-schema";
import { paginationGameSchema } from "../schemas/game.schema";

const gameRouter = Router();

gameRouter.post("/create-game", validateJWT, gameController.createGame);

gameRouter.post("/pin", validateJWT, gameController.getGameByPin);

gameRouter.get(
  "/hosted",
  validateJWT,
  validateSchema(paginationGameSchema, "query"),
  gameController.handleGetHostedGame
);

gameRouter.get(
  "/played",
  validateJWT,
  validateSchema(paginationGameSchema, "query"),

  gameController.handleGetPlayedGame
);

gameRouter.get(
  "/session/:id",
  validateJWT,
  gameController.handleGetGameSessionAndAnswer
);

export default gameRouter;
