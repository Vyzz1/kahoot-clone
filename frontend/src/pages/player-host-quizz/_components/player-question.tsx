import { useState, useEffect } from "react";
import { Button, Progress, Typography, Input } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface PlayerQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  questionEndTime?: Date;
  onSubmitAnswer: (
    answerId: string,
    answerTime: number,
    answerData?: any
  ) => void;
  disabled?: boolean;
  hasAnswered?: boolean;
}

export default function PlayerQuestion({
  question,
  questionIndex,
  totalQuestions,
  questionEndTime,
  onSubmitAnswer,
  disabled = false,
  hasAnswered = false,
}: PlayerQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(question.timeLimit);
  const [startTime] = useState(Date.now());

  const [shortAnswerText, setShortAnswerText] = useState("");

  const [orderItems, setOrderItems] = useState<string[]>(
    question.type === "ordering" && question.options
      ? question.options.map((opt) => opt._id)
      : []
  );

  useEffect(() => {
    if (!questionEndTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const endTime = new Date(questionEndTime).getTime();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [questionEndTime]);

  const handleAnswerSelect = (answerId: string, answerData?: any) => {
    if (disabled || hasAnswered || timeRemaining <= 0) return;

    setSelectedAnswer(answerId);
    const answerTime = (Date.now() - startTime) / 1000;
    onSubmitAnswer(answerId, answerTime, answerData);
  };

  const handleShortAnswerSubmit = () => {
    if (
      disabled ||
      hasAnswered ||
      timeRemaining <= 0 ||
      !shortAnswerText.trim()
    )
      return;

    const answerTime = (Date.now() - startTime) / 1000;
    onSubmitAnswer("short_answer", answerTime, {
      text: shortAnswerText.trim(),
    });
    setSelectedAnswer("short_answer");
  };

  const handleOrderingSubmit = () => {
    if (disabled || hasAnswered || timeRemaining <= 0) return;

    const answerTime = (Date.now() - startTime) / 1000;
    onSubmitAnswer("ordering", answerTime, { order: orderItems });
    setSelectedAnswer("ordering");
  };

  const moveOrderItem = (fromIndex: number, toIndex: number) => {
    if (disabled || hasAnswered || timeRemaining <= 0) return;

    const newOrder = [...orderItems];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setOrderItems(newOrder);
  };

  const getProgressColor = () => {
    const percentage = (timeRemaining / question.timeLimit) * 100;
    if (percentage > 60) return "#52c41a";
    if (percentage > 30) return "#faad14";
    return "#ff4d4f";
  };

  const getOptionColors = (optionId: string) => {
    if (!selectedAnswer) {
      return "hover:bg-blue-50 border-gray-200";
    }

    if (selectedAnswer === optionId) {
      return "bg-blue-100 border-blue-400 text-blue-700";
    }

    return "bg-gray-100 border-gray-200 text-gray-500";
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Question Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Text strong className="text-lg">
              Question {questionIndex + 1} of {totalQuestions}
            </Text>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              {question.points} {question.points === 1 ? "point" : "points"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ClockCircleOutlined />
            <Text strong className={timeRemaining <= 10 ? "text-red-500" : ""}>
              {timeRemaining}s
            </Text>
          </div>
        </div>

        {/* Timer Progress */}
        <Progress
          percent={(timeRemaining / question.timeLimit) * 100}
          strokeColor={getProgressColor()}
          showInfo={false}
          size="small"
          className="mb-4"
        />

        {/* Question Content */}
        <Title level={3} className="text-center mb-4">
          {question.content}
        </Title>

        {/* Media Content */}
        {question.media?.image && (
          <div className="text-center mb-4">
            <img
              src={question.media.image}
              alt="Question media"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
            />
          </div>
        )}

        {question.media?.video && (
          <div className="text-center mb-4">
            <video
              src={question.media.video}
              controls
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Answer Status */}
        {hasAnswered && (
          <div className="text-center mb-4">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              Answer submitted! Waiting for other players...
            </div>
          </div>
        )}

        {timeRemaining <= 0 && !hasAnswered && (
          <div className="text-center mb-4">
            <div className="inline-block px-4 py-2 bg-red-100 text-red-800 rounded-lg">
              Time's up!
            </div>
          </div>
        )}
      </div>

      {/* Answer Options */}
      {question.type === "multiple_choice" && question.options && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => (
            <Button
              key={option._id}
              size="large"
              className={`h-auto min-h-[80px] p-4 text-left border-2 transition-all ${getOptionColors(
                option._id
              )}`}
              onClick={() => handleAnswerSelect(option._id)}
              disabled={disabled || hasAnswered || timeRemaining <= 0}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1 text-wrap">{option.text}</div>
              </div>
            </Button>
          ))}
        </div>
      )}

      {question.type === "true_false" && question.options && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {question.options.map((option) => (
            <Button
              key={option._id}
              size="large"
              className={`h-20 text-xl font-bold border-2 transition-all ${getOptionColors(
                option._id
              )}`}
              onClick={() => handleAnswerSelect(option._id)}
              disabled={disabled || hasAnswered || timeRemaining <= 0}
            >
              {option.text}
            </Button>
          ))}
        </div>
      )}

      {question.type === "poll" && question.options && (
        <div className="space-y-3">
          <div className="text-center text-gray-600 mb-4">
            <Text>This is a poll question - no right or wrong answers!</Text>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, index) => (
              <Button
                key={option._id}
                size="large"
                className={`h-auto min-h-[60px] p-4 text-left border-2 transition-all ${getOptionColors(
                  option._id
                )}`}
                onClick={() => handleAnswerSelect(option._id)}
                disabled={disabled || hasAnswered || timeRemaining <= 0}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">{option.text}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {question.type === "short_answer" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center text-gray-600 mb-4">
            <Text>Type your answer below:</Text>
          </div>
          <div className="flex gap-3">
            <Input.TextArea
              placeholder="Enter your answer here..."
              value={shortAnswerText}
              onChange={(e) => setShortAnswerText(e.target.value)}
              disabled={disabled || hasAnswered || timeRemaining <= 0}
              rows={3}
              maxLength={500}
              className="flex-1"
            />
            <Button
              type="primary"
              size="large"
              onClick={handleShortAnswerSubmit}
              disabled={
                disabled ||
                hasAnswered ||
                timeRemaining <= 0 ||
                !shortAnswerText.trim()
              }
              className="h-auto"
            >
              Submit
            </Button>
          </div>
          {shortAnswerText.length > 0 && (
            <div className="text-right text-gray-500 text-sm">
              {shortAnswerText.length}/500 characters
            </div>
          )}
        </div>
      )}

      {question.type === "ordering" && question.options && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center text-gray-600 mb-4">
            <Text>Drag and drop to arrange items in the correct order:</Text>
          </div>
          <div className="space-y-3">
            {orderItems.map((itemId, index) => {
              const option = question.options?.find(
                (opt) => opt._id === itemId
              );
              if (!option) return null;

              return (
                <div
                  key={itemId}
                  className={`p-4 border-2 rounded-lg bg-white shadow-sm transition-all ${
                    disabled || hasAnswered || timeRemaining <= 0
                      ? "cursor-not-allowed bg-gray-50"
                      : "cursor-move hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">{option.text}</div>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        onClick={() =>
                          moveOrderItem(index, Math.max(0, index - 1))
                        }
                        disabled={
                          disabled ||
                          hasAnswered ||
                          timeRemaining <= 0 ||
                          index === 0
                        }
                      >
                        ↑
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          moveOrderItem(
                            index,
                            Math.min(orderItems.length - 1, index + 1)
                          )
                        }
                        disabled={
                          disabled ||
                          hasAnswered ||
                          timeRemaining <= 0 ||
                          index === orderItems.length - 1
                        }
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <Button
              type="primary"
              size="large"
              onClick={handleOrderingSubmit}
              disabled={disabled || hasAnswered || timeRemaining <= 0}
            >
              Submit Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
