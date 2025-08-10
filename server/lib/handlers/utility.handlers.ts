import { Server, Socket } from "socket.io";
import { getCorrectAnswer, mapQuestionToNoAns } from "../../utils/mapper";
import { GameSocketHandlers } from "../socket";

export const handleGetGameState = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return (data: any) => {
    console.log("getGameState event received");
    const { gameId } = data;

    if (!gameMap.has(gameId)) {
      throw new Error(`Game with ID ${gameId} does not exist.`);
    }

    const game = gameMap.get(gameId) as GameMap;

    const currentQuestionIndex =
      game?.currentQuestionIndex >= 0 ? game.currentQuestionIndex : 0;

    const currentQuestion = questionsMap.get(gameId)?.[currentQuestionIndex];

    const correctAnswer = getCorrectAnswer(
      questionsMap,
      gameId,
      currentQuestionIndex
    );

    if (!currentQuestion) {
      throw new Error(
        `Current question for game with ID ${gameId} does not exist.`
      );
    }

    const mappedCurrentQuestion = mapQuestionToNoAns(currentQuestion);

    if (game) {
      console.log(`Sending game state for gameId: ${gameId}`);
      io.to(gameId).emit("gameState", {
        ...game,
        currentQuestion: mappedCurrentQuestion,
        correctAnswer,
      });
    }
  };
};

export const handleGetLeaderboard = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return (data: any) => {
    const { gameId } = data;

    if (!gameMap.has(gameId)) {
      throw new Error(`Game with ID ${gameId} does not exist.`);
    }

    const game = gameMap.get(gameId);

    if (game) {
      const leaderboard = game.players.map((player) => ({
        id: player.id,
        displayName: player.displayName,
        score: player.score,
        rank: 0,
        avatar: player.avatar || "",
        lastAnswerCorrect:
          player.answers.length > 0
            ? player.answers[player.answers.length - 1].isCorrect
            : false,
        lastPointsEarned:
          player.answers.length > 0
            ? player.answers[player.answers.length - 1].pointsEarned
            : 0,
      }));

      leaderboard.sort((a, b) => b.score - a.score);

      leaderboard.forEach((player, index) => {
        player.rank = index + 1;
      });

      socket.emit("currentLeaderboard", {
        gameId,
        leaderboard,
        currentQuestionIndex: game.currentQuestionIndex,
      });
    }
  };
};
