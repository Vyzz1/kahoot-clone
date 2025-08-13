import { DocumentNotFoundError, ForbiddenError } from "../error/customError";
import gameModel from "../models/game.model";
import quizModel from "../models/quiz.model";
import User from "../models/user.model";
import Answer from "../models/answer.model";
import GameSession from "../models/gameSession.model";
import { getRandomRoomPIN } from "../utils/random";

class GamePersistService {
  async createGame(request: { quizzId: string; userId: string }) {
    const { quizzId, userId } = request;
    const roomPIN = getRandomRoomPIN();

    const [findQuiz, findUser] = await Promise.all([
      quizModel.findById(quizzId).lean().exec(),
      User.findById(userId).lean().exec(),
    ]);

    if (!findQuiz) {
      throw new DocumentNotFoundError("Quiz not found");
    }

    if (!findUser) {
      throw new DocumentNotFoundError("User not found");
    }

    const game = new gameModel({
      quiz: findQuiz._id,
      host: findUser._id,
      pin: roomPIN,
      players: [],
    });

    const savedGame = await game.save();

    return savedGame.toObject();
  }

  async getGameById(gameId: string) {
    const game = await gameModel
      .findById(gameId)

      .exec();

    if (!game) {
      throw new DocumentNotFoundError(`Game with ID ${gameId} does not exist.`);
    }

    if (game.status === "finished") {
      throw new ForbiddenError(`This game has already finished.`);
    }

    return game.toObject();
  }

  async getGameByPin(pin: string) {
    const game = await gameModel.findByPin(pin);

    if (!game) {
      throw new DocumentNotFoundError(`Game with PIN ${pin} does not exist.`);
    }

    if (game.status === "finished") {
      throw new ForbiddenError(`This game has already finished.`);
    }

    return game;
  }

  async savePlayerAnswer(answerData: {
    gameId: string;
    questionId: string;
    playerId: string;
    answerId: string;
    responseTime: number;
    pointsEarned: number;
    isCorrect: boolean;
    selectedOptionIndex?: number;
  }) {
    const {
      gameId,
      questionId,
      playerId,
      answerId,
      responseTime,
      pointsEarned,
      isCorrect,
      selectedOptionIndex,
    } = answerData;

    const existingAnswer = await Answer.findOne({
      game: gameId,
      question: questionId,
      player: playerId,
    });

    if (existingAnswer) {
      throw new ForbiddenError("Answer already submitted for this question");
    }

    const answer = new Answer({
      game: gameId,
      question: questionId,
      player: playerId,
      answer: {
        selectedOptionIndex,
      },
      responseTime,
      pointsEarned,
      isCorrect,
      submittedAt: new Date(),
    });

    await answer.save();

    await this.updateGameSession(
      gameId,
      playerId,
      pointsEarned,
      isCorrect,
      responseTime
    );

    return answer.toObject();
  }

  async updateGameSession(
    gameId: string,
    playerId: string,
    pointsEarned: number,
    isCorrect: boolean,
    responseTime: number
  ) {
    const session = await GameSession.findOne({
      game: gameId,
      player: playerId,
    });

    if (session) {
      session.totalScore += pointsEarned;
      session.totalAnswered += 1;

      if (isCorrect) {
        session.correctAnswers += 1;
        session.currentStreak += 1;
        session.maxStreak = Math.max(session.maxStreak, session.currentStreak);
      } else {
        session.currentStreak = 0;
      }

      session.averageResponseTime =
        (session.averageResponseTime * (session.totalAnswered - 1) +
          responseTime) /
        session.totalAnswered;

      await session.save();
      return session;
    }

    return null;
  }

  async addPlayerToGame(gameId: string, userId: string, displayName: string) {
    const [game, user] = await Promise.all([
      gameModel.findById(gameId),
      User.findById(userId),
    ]);

    if (!game) {
      throw new DocumentNotFoundError(`Game with ID ${gameId} does not exist.`);
    }

    if (!user) {
      throw new DocumentNotFoundError(`User with ID ${userId} does not exist.`);
    }

    if (game.status !== "waiting") {
      throw new ForbiddenError("Cannot join game that has already started");
    }

    const existingSession = await GameSession.findOne({
      game: gameId,
      player: userId,
    });
    if (existingSession) {
      return existingSession.toObject();
    }

    if (!game.players.includes(userId as any)) {
      game.players.push(userId as any);
      await game.save();
    }

    const gameSession = new GameSession({
      game: gameId,
      player: userId,
      displayName,
      totalScore: 0,
      correctAnswers: 0,
      totalAnswered: 0,
      averageResponseTime: 0,
      joinedAt: new Date(),
      status: "active",
    });

    await gameSession.save();
    return gameSession.toObject();
  }

  async startGame(gameId: string, hostId: string) {
    const game = await gameModel.findById(gameId);

    if (!game) {
      throw new DocumentNotFoundError(`Game with ID ${gameId} does not exist.`);
    }

    if (game.host.toString() !== hostId) {
      throw new ForbiddenError("Only the host can start the game");
    }

    if (game.status !== "waiting") {
      throw new ForbiddenError("Game has already started or finished");
    }

    if (game.players.length === 0) {
      throw new ForbiddenError("Cannot start game with no players");
    }

    game.status = "in_progress";
    game.startedAt = new Date();

    await game.save();
    return game.toObject();
  }

  async endGame(gameId: string, hostId: string) {
    const game = await gameModel.findById(gameId);

    if (!game) {
      throw new DocumentNotFoundError(`Game with ID ${gameId} does not exist.`);
    }

    if (game.host.toString() !== hostId) {
      throw new ForbiddenError("Only the host can end the game");
    }

    if (game.status === "finished") {
      throw new ForbiddenError("Game has already finished");
    }

    game.status = "finished";
    game.finishedAt = new Date();

    await game.save();

    await this.calculateFinalRanks(gameId);

    return game.toObject();
  }

  async calculateFinalRanks(gameId: string) {
    const sessions = await GameSession.find({ game: gameId })
      .sort({ totalScore: -1, averageResponseTime: 1 })
      .exec();

    const updates = sessions.map((session, index) => ({
      updateOne: {
        filter: { _id: session._id },
        update: {
          finalRank: index + 1,
          finishedAt: new Date(),
          status: "finished",
        },
      },
    }));

    if (updates.length > 0) {
      await GameSession.bulkWrite(updates);
    }

    return sessions;
  }

  async getGameLeaderboard(gameId: string) {
    const sessions = await GameSession.find({ game: gameId })
      .populate("player", "username email")
      .sort({ totalScore: -1, averageResponseTime: 1 })
      .exec();

    return sessions.map((session, index) => ({
      rank: index + 1,
      playerId: session.player,
      displayName: session.displayName,
      totalScore: session.totalScore,
      correctAnswers: session.correctAnswers,
      totalAnswered: session.totalAnswered,
      averageResponseTime: session.averageResponseTime,
      maxStreak: session.maxStreak,
      currentStreak: session.currentStreak,
    }));
  }

  async getGameStats(gameId: string) {
    const [game, sessions, answers] = await Promise.all([
      gameModel.findById(gameId).populate("quiz").populate("host", "username"),
      GameSession.find({ game: gameId }),
      Answer.find({ game: gameId }),
    ]);

    if (!game) {
      throw new DocumentNotFoundError(`Game with ID ${gameId} does not exist.`);
    }

    const totalPlayers = sessions.length;
    const totalAnswers = answers.length;
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const averageScore =
      sessions.reduce((sum, s) => sum + s.totalScore, 0) / totalPlayers || 0;
    const averageResponseTime =
      answers.reduce((sum, a) => sum + a.responseTime, 0) / totalAnswers || 0;

    return {
      game: game.toObject(),
      stats: {
        totalPlayers,
        totalAnswers,
        correctAnswers,
        accuracyRate:
          totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
        averageScore,
        averageResponseTime,
        completionRate: game.status === "finished" ? 100 : 0,
      },
      leaderboard: await this.getGameLeaderboard(gameId),
    };
  }

  async removePlayerFromGame(gameId: string, playerId: string) {
    const game = await gameModel.findById(gameId);

    if (!game) {
      throw new DocumentNotFoundError(`Game with ID ${gameId} does not exist.`);
    }

    game.players = game.players.filter((p) => p.toString() !== playerId);
    await game.save();

    await GameSession.findOneAndUpdate(
      { game: gameId, player: playerId },
      { status: "disconnected", finishedAt: new Date() }
    );

    return game.toObject();
  }

  async getQuizIdByGameId(gameId: string) {
    const game = await gameModel.findById(gameId).lean();
    if (!game) {
      throw new DocumentNotFoundError(`Game with ID ${gameId} does not exist.`);
    }
    return game.quiz.toString();
  }
}

export default new GamePersistService();
