import { List, Tag, Button, Tooltip } from "antd";
import type { Question } from "@/types/global";
import {
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  DragOutlined, // Import for drag icon
} from "@ant-design/icons";
import React, { useState } from 'react';

interface Props {
  questions: Question[];
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
  onReorder: (newOrder: Question[]) => void; // New prop for reordering
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

export default function QuestionList({ questions, onEdit, onDelete, onReorder }: Props) {
  const [draggedItem, setDraggedItem] = useState<Question | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, question: Question) => {
    setDraggedItem(question);
    e.dataTransfer.effectAllowed = "move";
    // Set a dummy data to make dragging work in some browsers
    e.dataTransfer.setData("text/plain", question._id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetItem: Question) => {
    e.preventDefault();
    if (!draggedItem || draggedItem._id === targetItem._id) {
      return;
    }

    const newQuestions = [...questions];
    const draggedIndex = newQuestions.findIndex(q => q._id === draggedItem._id);
    const targetIndex = newQuestions.findIndex(q => q._id === targetItem._id);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Remove the dragged item from its original position
    const [removed] = newQuestions.splice(draggedIndex, 1);
    // Insert it at the new position
    newQuestions.splice(targetIndex, 0, removed);

    onReorder(newQuestions);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <List
      bordered
      dataSource={questions}
      locale={{ emptyText: "No questions added yet." }}
      renderItem={(q, index) => (
        <List.Item
          key={q._id} // Ensure key is unique and stable
          draggable="true"
          onDragStart={(e) => handleDragStart(e, q)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, q)}
          onDragEnd={handleDragEnd}
          className={`
            ${draggedItem && draggedItem._id === q._id ? 'opacity-50 border-dashed border-2 border-blue-400' : ''}
            ${draggedItem && draggedItem._id !== q._id ? 'hover:bg-blue-50 transition-colors duration-200' : ''}
          `}
          actions={[
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(q)}
                className="rounded-md"
              />
            </Tooltip>,
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={() => onDelete(q._id!)} // Use q._id! as it always exists when displayed in the list
                className="rounded-md"
              />
            </Tooltip>,
            <Tooltip title="Drag to reorder">
              <Button
                icon={<DragOutlined />}
                size="small"
                className="cursor-grab rounded-md"
              />
            </Tooltip>,
          ]}
        >
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-800">
                {index + 1}. {q.content}
                <Tag color={getColorByType(q.type)} className="ml-2 rounded-full px-3 py-1 text-xs">
                  {q.type.replace("_", " ").toUpperCase()}
                </Tag>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <ClockCircleOutlined />
                {q.timeLimit}s
                {q.points !== undefined && ( // Display points if available
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    {q.points} pts
                  </span>
                )}
              </div>
            </div>

            {q.media?.image && (
              <div className="mt-2">
                <img src={q.media.image} alt="Question media" className="max-w-full h-auto rounded-md shadow-sm" onError={(e) => { e.currentTarget.src = "https://placehold.co/150x100/E0E0E0/ADADAD?text=Image+Error"; }} />
              </div>
            )}
            {q.media?.video && (
              <div className="mt-2">
                <video controls className="max-w-full h-auto rounded-md shadow-sm">
                  <source src={q.media.video} type="video/mp4" onError={(e) => { console.error("Video load error", e); }} />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {q.answers && q.answers.length > 0 && (
              <ul className="list-disc ml-6 mt-2 text-sm text-gray-700">
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
              <ol className="list-decimal ml-6 mt-2 text-sm text-gray-700">
                {q.correctOrder.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}

            {q.answerText && (
              <p className="ml-6 mt-2 text-sm text-gray-700">
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