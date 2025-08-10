import { Card, List, Tag } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

interface AnswerHistoryProps {
  answers: GameSessionResponse["answers"];
}

interface QuestionData {
  question: GameSessionResponse["answers"][0]["question"];
  answer: GameSessionResponse["answers"][0] | undefined;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
}

export default function AnswerHistory({ answers }: AnswerHistoryProps) {
  const questionData: QuestionData[] = answers.map((answer) => ({
    question: answer.question,
    answer,
    isCorrect: answer.isCorrect,
    timeSpent: answer.responseTime,
    pointsEarned: answer.pointsEarned,
  }));

  const getStatusIcon = (isCorrect: boolean, answered: boolean) => {
    if (!answered) {
      return <ClockCircleOutlined className="text-gray-400" />;
    }
    return isCorrect ? (
      <CheckCircleOutlined className="text-green-500" />
    ) : (
      <CloseCircleOutlined className="text-red-500" />
    );
  };

  const getStatusColor = (isCorrect: boolean, answered: boolean) => {
    if (!answered) return "default";
    return isCorrect ? "success" : "error";
  };

  const getStatusText = (isCorrect: boolean, answered: boolean) => {
    if (!answered) return "No Answer";
    return isCorrect ? "Correct" : "Incorrect";
  };

  return (
    <Card title="Answer History" className="mb-6">
      <List
        dataSource={questionData}
        renderItem={(item, index) => {
          const answered = !!item.answer;
          const timeLimit = item.question.timeLimit || 30;

          return (
            <List.Item className="border-b border-gray-100 last:border-b-0">
              <div className="w-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    {getStatusIcon(item.isCorrect, answered)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {item.question.content}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <Tag color={getStatusColor(item.isCorrect, answered)}>
                          {getStatusText(item.isCorrect, answered)}
                        </Tag>
                        {answered && (
                          <>
                            <span>
                              Time: {(item.timeSpent / 1000).toFixed(1)}s /{" "}
                              {timeLimit}s
                            </span>
                            <span className="text-green-600 font-medium">
                              +{item.pointsEarned} points
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {answered && (
                  <div className="ml-11">
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">
                        Response Time: {item.timeSpent}s
                      </span>
                    </div>

                    {item.answer && item.question.options && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        {item.question.options.map((option, optionIndex) => {
                          const isSelected =
                            item.answer!.answer.selectedOptionIndex ===
                            optionIndex;

                          let optionClass = "p-2 rounded border text-sm ";
                          if (item.isCorrect && isSelected) {
                            optionClass +=
                              "bg-green-50 border-green-300 text-green-700";
                          } else if (isSelected) {
                            optionClass +=
                              "bg-red-50 border-red-300 text-red-700";
                          } else {
                            optionClass +=
                              "bg-gray-50 border-gray-200 text-gray-600";
                          }

                          return (
                            <div key={optionIndex} className={optionClass}>
                              <div className="flex items-center gap-2">
                                {item.isCorrect && isSelected && (
                                  <CheckCircleOutlined className="text-green-500" />
                                )}
                                {!item.isCorrect && isSelected && (
                                  <CloseCircleOutlined className="text-red-500" />
                                )}
                                <span>{option.text}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </List.Item>
          );
        }}
      />
    </Card>
  );
}
