import { Server, Socket } from "socket.io";
import { QuestionDocument } from "../../models/question.model";
import gameQueueService from "../../services/gameQueue.service";
import { GameSocketHandlers } from "../socket";

export const handleSubmitAnswer = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return async (data: any) => {
    const { gameId, answerId, answerTime, answerData } = data;
    const userId = socket.data.userId;

    try {
      if (!gameMap.has(gameId)) {
        throw new Error(`Game with ID ${gameId} does not exist.`);
      }

      const game = gameMap.get(gameId);

      if (
        game &&
        game.status === "in_progress" &&
        !game.isCurrentQuestionEnded
      ) {
        const player = game.players.find((p) => p.id === userId);
        const currentQuestion = questionsMap.get(gameId)?.[
          game.currentQuestionIndex
        ] as QuestionDocument;

        if (player && currentQuestion) {
          const alreadyAnswered = player.answers.find(
            (a) => a.questionIndex === game.currentQuestionIndex
          );
          if (alreadyAnswered) {
            socket.emit("answerError", {
              error: "Already answered this question",
            });
            return;
          }

          let isCorrect = false;
          let pointsEarned = 0;
          let correctAnswer = null;

          switch (currentQuestion.type) {
            case "multiple_choice":
            case "true_false":
              const correctOption = currentQuestion.options?.find(
                (option) => option.isCorrect
              );
              isCorrect = !!(
                correctOption && correctOption._id?.toString() === answerId
              );
              correctAnswer = correctOption;
              break;

            case "poll":
              isCorrect = true;
              break;

            case "short_answer":
              if (answerData?.text && currentQuestion.answerText) {
                const userAnswer = answerData.text.toLowerCase().trim();
                const expectedAnswer = currentQuestion.answerText
                  .toLowerCase()
                  .trim();
                isCorrect = userAnswer === expectedAnswer;
              }
              correctAnswer = { text: currentQuestion.answerText };
              break;

            case "ordering":
              if (answerData?.order && currentQuestion.correctOrder) {
                isCorrect =
                  JSON.stringify(answerData.order) ===
                  JSON.stringify(currentQuestion.correctOrder);
              }
              correctAnswer = { order: currentQuestion.correctOrder };
              break;

            default:
              break;
          }

          if (isCorrect) {
            const basePoints = currentQuestion.points || 1000;
            const timeLimit = currentQuestion.timeLimit;

            if (currentQuestion.type === "poll") {
              pointsEarned = Math.round(basePoints * 0.5);
            } else {
              const timeBonus = Math.max(
                0,
                (timeLimit - answerTime) / timeLimit
              );
              pointsEarned = Math.round(basePoints * (0.5 + 0.5 * timeBonus));
            }
          }

          const selectedOptionIndex = currentQuestion.options?.findIndex(
            (option) => option._id?.toString() === answerId
          );

          player.answers.push({
            questionIndex: game.currentQuestionIndex,
            answerId,
            answerTime,
            isCorrect: !!isCorrect,
            pointsEarned,
          });

          player.score += pointsEarned;

          console.log(
            `Player ${player.displayName} answered question ${
              game.currentQuestionIndex + 1
            } (${currentQuestion.type}): ${
              isCorrect ? "Correct" : "Incorrect"
            } (+${pointsEarned} points)`
          );

          socket.emit("answerSubmitted", {
            questionIndex: game.currentQuestionIndex,
            isCorrect: !!isCorrect,
            pointsEarned,
            correctAnswer: correctAnswer,
            totalScore: player.score,
          });

          io.to(gameId).emit("playerAnswered", {
            playerId: userId,
            displayName: player.displayName,
            answered: true,
          });

          io.to(gameId).emit("gameUpdate", game);

          gameQueueService
            .addToQueue(
              "saveAnswer",
              {
                gameId,
                questionId: (currentQuestion as any)._id?.toString() || "",
                playerId: userId,
                answerId,
                answerData: answerData || null,
                responseTime: answerTime,
                pointsEarned,
                isCorrect: !!isCorrect,
                selectedOptionIndex,
              },
              1
            )
            .catch((error) => {
              console.error("Failed to queue answer save:", error);
            });
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      socket.emit("answerError", {
        error:
          error instanceof Error ? error.message : "Failed to submit answer",
      });
    }
  };
};

export const handleGetPreviousAnswerResult = ({
  socket,
  io,
  gameMap,
  questionsMap,
}: GameSocketHandlers) => {
  return (data: any) => {
    const { gameId } = data;
    const userId = socket.data.userId;

    if (!gameMap.has(gameId)) {
      throw new Error(`Game with ID ${gameId} does not exist.`);
    }

    const game = gameMap.get(gameId);

    if (game) {
      //get for userId

      const player = game.players.find((p) => p.id === userId);

      console.log(`Player ${userId} found in game ${gameId}:`, player);

      if (!player) {
        throw new Error(
          `Player with ID ${userId} not found in game ${gameId}.`
        );
      }

      const answerResult = player.answers
        .map((answer) => ({
          questionIndex: answer.questionIndex,
          answerId: answer.answerId,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
        }))
        .find((answer) => answer.questionIndex === game.currentQuestionIndex);

      socket.emit("previousAnswerResult", {
        gameId,
        answerResult,
      });
    }
  };
};
