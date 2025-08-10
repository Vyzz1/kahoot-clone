import { Server, Socket } from "socket.io";
import { QuestionDocument } from "../../models/question.model";
import gameQueueService from "../../services/gameQueue.service";
import { getCorrectAnswer, mapQuestionToNoAns } from "../../utils/mapper";
import { GameSocketHandlers } from "../socket";

export const handleEndQuestion = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return async (data: any) => {
    const { gameId } = data;

    if (!gameMap.has(gameId)) {
      throw new Error(`Game with ID ${gameId} does not exist.`);
    }
    if (!questionsMap.has(gameId)) {
      throw new Error(`Questions for game with ID ${gameId} do not exist.`);
    }

    const getQuestions = questionsMap.get(gameId)!;

    const game = gameMap.get(gameId);
    if (game) {
      game.isCurrentQuestionEnded = true;
      game.status = "waiting_for_next_question";

      const leaderboard = game.players.map((player) => ({
        id: player.id,
        displayName: player.displayName,
        score: player.score,
        rank: 0,
        lastAnswerCorrect:
          player.answers.length > 0
            ? player.answers[player.answers.length - 1].isCorrect
            : false,
        lastPointsEarned:
          player.answers.length > 0
            ? player.answers[player.answers.length - 1].pointsEarned
            : 0,
        avatar: player.avatar || "",
      }));

      leaderboard.sort((a, b) => b.score - a.score);

      leaderboard.forEach((player, index) => {
        player.rank = index + 1;
      });

      const isLastQuestion =
        game.currentQuestionIndex >= getQuestions.length - 1;

      console.log(
        `Question ${game.currentQuestionIndex + 1} ended for game ${gameId}`
      );

      io.to(gameId).emit("questionEnded", {
        gameId,
        currentQuestionIndex: game.currentQuestionIndex,
        leaderboard,
        isLastQuestion,
        correctAnswer: getCorrectAnswer(
          questionsMap,
          gameId,
          game.currentQuestionIndex
        ),
      });

      if (isLastQuestion) {
        game.status = "finished";
        game.finishedAt = new Date();
        console.log(`Game ${gameId} finished.`);

        gameQueueService
          .addToQueue("endGame", {
            gameId,
            hostId: game.hostId,
          })
          .catch((error) => {
            console.error("Failed to queue endGame:", error);
          });

        io.to(gameId).emit("gameFinished", {
          gameId,
          finalLeaderboard: leaderboard,
          game,
        });
      }

      io.to(gameId).emit("gameUpdate", game);
    }
  };
};

export const handleNextQuestion = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return (data: any) => {
    console.log("Next question:", data);
    const { gameId } = data;

    if (!gameMap.has(gameId)) {
      throw new Error(`Game with ID ${gameId} does not exist.`);
    }

    const questions = questionsMap.get(gameId)!;

    const game = gameMap.get(gameId);

    if (game && game.status === "waiting_for_next_question") {
      game.currentQuestionIndex++;

      if (game.currentQuestionIndex < questions.length) {
        const findQuestions = questions[game.currentQuestionIndex];

        const nextQuestion = mapQuestionToNoAns(findQuestions);
        game.currentQuestion = nextQuestion.content;
        game.questionEndTime = new Date(
          Date.now() + nextQuestion.timeLimit * 1000
        );
        game.isCurrentQuestionEnded = false;
        game.status = "in_progress";

        console.log(
          `Moving to question ${
            game.currentQuestionIndex + 1
          } for game ${gameId}`
        );

        io.to(gameId).emit("nextQuestionStarted", {
          gameId,
          questionIndex: game.currentQuestionIndex,
          question: nextQuestion,
          questionEndTime: game.questionEndTime,
        });

        console.log(game.isCurrentQuestionEnded);
        io.to(gameId).emit("gameUpdate", game);
      } else {
        game.status = "finished";
        game.finishedAt = new Date();

        io.to(gameId).emit("gameFinished", {
          gameId,
          game,
        });
      }
    }
  };
};
