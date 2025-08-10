import { Response } from "express";
import { TypedRequest } from "../types/express";
import gamePersistService from "../services/gamePersist.service";
import getGameService from "../services/getGame.service";
import { PaginationGameRequest } from "../schemas/game.schema";

class GameControler {
  async createGame(
    req: TypedRequest<{ TBody: { quizzId: string } }>,
    res: Response
  ) {
    const { quizzId } = req.body;
    const userId = req.user!.userId;

    const result = await gamePersistService.createGame({ quizzId, userId });
    res.status(201).json(result);
  }

  async getGameByPin(
    req: TypedRequest<{ TBody: { pin: string } }>,
    res: Response
  ) {
    const { pin } = req.body;

    const game = await gamePersistService.getGameByPin(pin);
    res.status(200).json(game);
  }

  async handleGetHostedGame(
    req: TypedRequest<{ TQuery: PaginationGameRequest }>,
    res: Response
  ) {
    const userId = req.user!.userId;

    const games = await getGameService.getHostedGames(userId, req.query);
    res.status(200).json(games);
  }

  async handleGetPlayedGame(
    req: TypedRequest<{ TQuery: PaginationGameRequest }>,
    res: Response
  ) {
    const userId = req.user!.userId;

    const games = await getGameService.getPlayedGames(userId, req.query);
    res.status(200).json(games);
  }

  async handleGetGameSessionAndAnswer(
    req: TypedRequest<{ TParams: { id: string } }>,
    res: Response
  ) {
    const userId = req.user!.userId;
    const gameId = req.params.id;

    const results = await getGameService.getGameSessionAndAnswer(
      userId,
      gameId
    );
    res.status(200).json(results);
  }
}

export default new GameControler();
