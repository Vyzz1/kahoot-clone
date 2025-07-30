import { Response } from "express";
import gameService from "../services/game.service";
import { TypedRequest } from "../types/express";

class GameControler {
  async createGame(
    req: TypedRequest<{ TBody: { quizzId: string } }>,
    res: Response
  ) {
    const { quizzId } = req.body;

    const userId = req.user!.userId;

    const result = await gameService.createGame({ quizzId, userId });
    res.status(201).json(result);
  }

  async getGameById(
    req: TypedRequest<{ TParams: { id: string } }>,
    res: Response
  ) {
    const { id } = req.params;

    const game = await gameService.getGameById(id);
    res.status(200).json(game);
  }

  async getGameByPin(
    req: TypedRequest<{ TBody: { pin: string } }>,
    res: Response
  ) {
    const { pin } = req.body;

    const game = await gameService.getGameByPin(pin);
    res.status(200).json(game);
  }

  async getGameStats(
    req: TypedRequest<{ TParams: { id: string } }>,
    res: Response
  ) {
    const { id } = req.params;

    const stats = await gameService.getGameStats(id);
    res.status(200).json(stats);
  }

  async getGameLeaderboard(
    req: TypedRequest<{ TParams: { id: string } }>,
    res: Response
  ) {
    const { id } = req.params;

    const leaderboard = await gameService.getGameLeaderboard(id);
    res.status(200).json({ leaderboard });
  }

  async joinGame(
    req: TypedRequest<{
      TParams: { id: string };
      TBody: { displayName: string };
    }>,
    res: Response
  ) {
    const { id } = req.params;
    const { displayName } = req.body;
    const userId = req.user!.userId;

    const session = await gameService.addPlayerToGame(id, userId, displayName);
    res.status(200).json(session);
  }
}

export default new GameControler();
