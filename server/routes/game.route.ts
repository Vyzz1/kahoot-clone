import { Router } from "express";
import validateJWT from "../middlewares/validate-jwt";
import gameController from "../controllers/game.controller";

const gameRouter = Router();

gameRouter.post("/create-game", validateJWT, gameController.createGame);

gameRouter.get("/:id", validateJWT, gameController.getGameById);

gameRouter.post("/pin", validateJWT, gameController.getGameByPin);

gameRouter.get("/:id/stats", validateJWT, gameController.getGameStats);

gameRouter.get("/:id/quiz-id", validateJWT, gameController.getGameQuizId);

gameRouter.get("/:id/leaderboard", validateJWT, gameController.getGameLeaderboard);

gameRouter.post("/:id/join", validateJWT, gameController.joinGame);

export default gameRouter;
