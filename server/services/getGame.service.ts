import { UnauthorizedError } from "../error/customError";
import GameModel from "../models/game.model";
import User from "../models/user.model";
import GameSession from "../models/gameSession.model";
import Answer from "../models/answer.model";
import { PaginationGameRequest } from "../schemas/game.schema";
import { PagedResult } from "../config/paged-result";

class GetGameService {
  async getHostedGames(userId: string, request: PaginationGameRequest) {
    const user = await User.findById(userId).lean();

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    let {
      pageSize = 10,
      currentPage = 1,
      sortBy = "createdAt",
      sortOrder = "asc",
      search,
      statuses,
    } = request;

    const skip = (currentPage - 1) * pageSize;
    const query: any = {};

    query.host = userId;

    if (search) {
      query.$or = [{ "quiz.title": { $regex: search, $options: "i" } }];
    }

    if (typeof statuses === "string") {
      statuses = [statuses];
    }

    if (statuses && statuses.length > 0) {
      query.status = { $in: statuses };
    }
    console.log("Query for played games:", query);

    const sort: any = {};

    sort[sortBy] = sortOrder === "ascend" ? 1 : -1;

    const totalCount = await GameModel.countDocuments(query);

    const games = await GameModel.find(query)
      .populate("quiz", "title description")
      .populate("players", "fullName avatar email")
      .select("-__v -settings")
      .sort(sort)
      .skip(skip < 0 ? 0 : skip)
      .limit(pageSize)

      .lean();

    if (games.some((g) => g.host._id.toString() !== userId)) {
      throw new UnauthorizedError("You are not the host of these games");
    }

    return new PagedResult(games, totalCount, currentPage, pageSize).response;
  }

  async getPlayedGames(userId: string, request: PaginationGameRequest) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    let {
      pageSize = 10,
      currentPage = 1,
      sortBy = "createdAt",
      sortOrder = "asc",
      search,
      statuses,
    } = request;

    const skip = (currentPage - 1) * pageSize;
    const query: any = {};

    query.players = userId;

    if (search) {
      query.$or = [{ "quiz.title": { $regex: search, $options: "i" } }];
    }

    if (typeof statuses === "string") {
      statuses = [statuses];
    }

    if (statuses && statuses.length > 0) {
      query.status = { $in: statuses };
    }

    const sort: any = {};

    sort[sortBy] = sortOrder === "ascend" ? 1 : -1;

    const totalCount = await GameModel.countDocuments(query);
    const games = await GameModel.find(query)
      .populate("quiz", "title description")
      .populate("host", "fullName avatar email")
      .select("-__v -settings  -updatedAt")
      .sort(sort)
      .skip(skip < 0 ? 0 : skip)
      .limit(pageSize)

      .lean();

    return new PagedResult(games, totalCount, currentPage, pageSize).response;
  }

  async getGameSessionAndAnswer(userId: string, gameId: string) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const gameSession = await GameSession.findOne({
      game: gameId,
      player: userId,
    })
      .populate({
        path: "game",
        select: "title pin status startedAt finishedAt",
        populate: {
          path: "quiz",
          select: "title description questions",
        },
      })
      .populate("player", "fullName avatar email")
      .lean();

    if (!gameSession) {
      throw new UnauthorizedError("Game session not found for this user");
    }

    const answers = await Answer.find({
      game: gameId,
      player: userId,
    })
      .populate({
        path: "question",
        select: "content type options points timeLimit correctOrder answerText",
      })
      .sort({ submittedAt: 1 })
      .lean();

    const leaderboard = await GameSession.find({ game: gameId })
      .populate("player", "fullName avatar")
      .select(
        "player displayName totalScore finalRank correctAnswers totalAnswered"
      )
      .sort({ totalScore: -1 })
      .lean();

    const totalResponseTime = answers.reduce(
      (sum, answer) => sum + answer.responseTime,
      0
    );
    const averageResponseTime =
      answers.length > 0 ? totalResponseTime / answers.length : 0;

    let maxStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    answers.forEach((answer) => {
      if (answer.isCorrect) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i].isCorrect) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      gameSession: {
        ...gameSession,
        averageResponseTime: averageResponseTime,
        maxStreak,
        currentStreak,
      },
      answers: answers.map((answer) => ({
        ...answer,
        question: {
          ...answer.question,
          options: (answer.question as any).options?.map((opt: any) => ({
            _id: opt._id,
            text: opt.text,
          })),
        },
      })),
      leaderboard,
      statistics: {
        totalQuestions: (gameSession.game as any).quiz.questions.length,
        correctAnswers: gameSession.correctAnswers,
        accuracy:
          answers.length > 0
            ? (gameSession.correctAnswers / answers.length) * 100
            : 0,
        averageResponseTime,
        maxStreak,
        currentStreak,
        totalPoints: gameSession.totalScore,
        rank:
          gameSession.finalRank ||
          leaderboard.findIndex(
            (p) => (p.player as any)._id.toString() === userId
          ) + 1,
      },
    };
  }
}
export default new GetGameService();
