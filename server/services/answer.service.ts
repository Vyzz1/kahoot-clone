import Answer from "../models/answer.model";
import GameSession from "../models/gameSession.model";
import Question from "../models/question.model";
import Game from "../models/game.model";
import {
  SubmitAnswerBody,
  UpdateGameSessionBody,
} from "../schemas/answer.schema";

export class AnswerService {
  /**
   * Submit một câu trả lời từ người chơi
   */
  static async submitAnswer(answerData: SubmitAnswerBody, playerId: string) {
    const { gameId, questionId, answer, responseTime } = answerData;

    // Kiểm tra game có tồn tại không
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Kiểm tra question có thuộc game này không
    const question = await Question.findOne({
      _id: questionId,
      quiz: game.quiz,
    });
    if (!question) {
      throw new Error("Question not found or does not belong to this game");
    }

    // Kiểm tra player có tham gia game này không
    if (!game.players.includes(playerId as any)) {
      throw new Error("Player is not part of this game");
    }

    // Kiểm tra player đã trả lời câu hỏi này chưa
    const existingAnswer = await Answer.findOne({
      game: gameId,
      question: questionId,
      player: playerId,
    });

    if (existingAnswer) {
      throw new Error("Player has already answered this question");
    }

    // Tính điểm và kiểm tra đúng sai
    const { isCorrect, pointsEarned } = this.calculateScore(
      question,
      answer,
      responseTime
    );

    // Lưu answer
    const newAnswer = new Answer({
      game: gameId,
      question: questionId,
      player: playerId,
      answer,
      responseTime,
      pointsEarned,
      isCorrect,
    });

    await newAnswer.save();

    // Cập nhật game session
    await this.updateGameSession(
      gameId,
      playerId,
      pointsEarned,
      isCorrect,
      responseTime
    );

    return newAnswer;
  }

  /**
   * Tính điểm số dựa trên câu trả lời
   */
  private static calculateScore(
    question: any,
    answer: any,
    responseTime: number
  ) {
    let isCorrect = false;
    let pointsEarned = 0;

    switch (question.type) {
      case "multiple_choice":
        if (answer.selectedOptionIndex !== undefined) {
          const selectedOption = question.options[answer.selectedOptionIndex];
          isCorrect = selectedOption?.isCorrect || false;
        }
        break;

      case "true_false":
        if (answer.booleanAnswer !== undefined) {
          const correctOption = question.options.find(
            (opt: any) => opt.isCorrect
          );
          isCorrect = answer.booleanAnswer === (correctOption?.text === "true");
        }
        break;

      case "short_answer":
        if (answer.textAnswer) {
          isCorrect =
            answer.textAnswer.toLowerCase().trim() ===
            question.answerText?.toLowerCase().trim();
        }
        break;

      case "ordering":
        if (answer.orderAnswer && question.correctOrder) {
          isCorrect =
            JSON.stringify(answer.orderAnswer) ===
            JSON.stringify(question.correctOrder);
        }
        break;

      case "poll":
        // Poll không có đúng sai, chỉ để thu thập ý kiến
        isCorrect = true;
        break;
    }

    if (isCorrect && question.type !== "poll") {
      // Tính điểm dựa trên thời gian trả lời (càng nhanh càng nhiều điểm)
      const timeBonus = Math.max(
        0,
        (question.timeLimit * 1000 - responseTime) / 1000
      );
      pointsEarned = Math.round(
        question.points * (1 + timeBonus / question.timeLimit)
      );
    }

    return { isCorrect, pointsEarned };
  }

  /**
   * Cập nhật game session của player
   */
  private static async updateGameSession(
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

    if (!session) {
      throw new Error("Game session not found");
    }

    // Cập nhật điểm số và thống kê
    session.totalScore += pointsEarned;
    session.totalAnswered += 1;

    if (isCorrect) {
      session.correctAnswers += 1;
      session.currentStreak += 1;
      session.maxStreak = Math.max(session.maxStreak, session.currentStreak);
    } else {
      session.currentStreak = 0;
    }

    // Cập nhật thời gian trung bình
    const totalResponseTime =
      session.averageResponseTime * (session.totalAnswered - 1) + responseTime;
    session.averageResponseTime = Math.round(
      totalResponseTime / session.totalAnswered
    );

    await session.save();
    return session;
  }

  /**
   * Lấy tất cả answers của một game
   */
  static async getAnswersByGame(
    gameId: string,
    questionId?: string,
    playerId?: string
  ) {
    const filter: any = { game: gameId };

    if (questionId) filter.question = questionId;
    if (playerId) filter.player = playerId;

    return await Answer.find(filter)
      .populate("question", "content type options correctOrder answerText")
      .populate("player", "fullName email avatar")
      .sort({ submittedAt: 1 });
  }

  /**
   * Lấy leaderboard của một game
   */
  static async getGameLeaderboard(gameId: string) {
    return await GameSession.find({ game: gameId })
      .populate("player", "fullName email avatar")
      .sort({ totalScore: -1, averageResponseTime: 1 })
      .exec();
  }

  /**
   * Lấy thống kê chi tiết của một player trong game
   */
  static async getPlayerGameStats(gameId: string, playerId: string) {
    const session = await GameSession.findOne({
      game: gameId,
      player: playerId,
    }).populate("player", "fullName email avatar");

    const answers = await Answer.find({ game: gameId, player: playerId })
      .populate("question", "content type points")
      .sort({ submittedAt: 1 });

    return {
      session,
      answers,
      accuracy: session
        ? (session.correctAnswers / session.totalAnswered) * 100
        : 0,
    };
  }

  /**
   * Tạo game session mới cho player
   */
  static async createGameSession(
    gameId: string,
    playerId: string,
    displayName: string
  ) {
    const existingSession = await GameSession.findOne({
      game: gameId,
      player: playerId,
    });

    if (existingSession) {
      throw new Error("Player already has a session for this game");
    }

    const session = new GameSession({
      game: gameId,
      player: playerId,
      displayName,
    });

    return await session.save();
  }

  /**
   * Kết thúc game và tính ranking
   */
  static async finishGame(gameId: string) {
    const sessions = await GameSession.find({ game: gameId }).sort({
      totalScore: -1,
      averageResponseTime: 1,
    });

    // Cập nhật ranking
    for (let i = 0; i < sessions.length; i++) {
      sessions[i].finalRank = i + 1;
      sessions[i].status = "finished";
      sessions[i].finishedAt = new Date();
      await sessions[i].save();
    }

    // Cập nhật game status
    await Game.findByIdAndUpdate(gameId, {
      status: "finished",
      finishedAt: new Date(),
    });

    return sessions;
  }
}
