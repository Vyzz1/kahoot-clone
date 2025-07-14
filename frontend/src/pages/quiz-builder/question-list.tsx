import { List, Tag, Button, Tooltip } from "antd";
import type { Question } from "@/types/types";
import {
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

interface Props {
  questions: Question[];
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
}

const getColorByType = (type: string) => {
  switch (type) {
    case "multiple_choice":
      return "blue";
    case "true_false":
      return "green";
    case "poll":
      return "gold";
    case "ordering":
      return "purple";
    case "short_answer":
      return "red";
    default:
      return "default";
  }
};

export default function QuestionList({ questions, onEdit, onDelete }: Props) {
  return (
    <List
      bordered
      dataSource={questions}
      locale={{ emptyText: "No questions added." }}
      renderItem={(q, index) => (
        <List.Item
          actions={[
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(q)}
              />
            </Tooltip>,
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={() => onDelete(q._id)}
              />
            </Tooltip>,
          ]}
        >
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {index + 1}. {q.title}
                <Tag color={getColorByType(q.type)} className="ml-2">
                  {q.type.replace("_", " ").toUpperCase()}
                </Tag>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <ClockCircleOutlined />
                {q.timeLimit}s
              </div>
            </div>

            {q.answers && q.answers.length > 0 && (
              <ul className="list-disc ml-6 mt-1 text-sm text-gray-700">
                {q.answers.map((a, i) => (
                  <li
                    key={i}
                    className={a.isCorrect ? "font-bold text-green-600" : ""}
                  >
                    {a.text}
                  </li>
                ))}
              </ul>
            )}

            {q.correctOrder && (
              <ol className="list-decimal ml-6 mt-1 text-sm text-gray-700">
                {q.correctOrder.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}

            {q.answerText && (
              <p className="ml-6 mt-1 text-sm text-gray-700">
                Correct Answer:{" "}
                <span className="font-semibold text-green-600">{q.answerText}</span>
              </p>
            )}
          </div>
        </List.Item>
      )}
    />
  );
}
