// QuestionPlayer.tsx - Đã chỉnh sửa
import { Card, Typography, Space, Button } from "antd";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { AnswerOption } from "@/types/global";

const { Title } = Typography;

interface Props {
  question: {
    _id: string;
    content?: string;
    options: AnswerOption[];
    correctAnswer: string;
  };
  index: number;
  total: number;
  onAnswer: (answer: string) => void;
  selectedAnswer?: string | null;
  isTimeout?: boolean;
}

const QuestionPlayer = ({ question, index, total, onAnswer, selectedAnswer, isTimeout = false }: Props) => {
  const [showCorrectHint, setShowCorrectHint] = useState(false);
  const [selected, setSelected] = useState<string | null>(selectedAnswer || null);
  const [animationTarget, setAnimationTarget] = useState<string | null>(null);
  const [isCorrectChoice, setIsCorrectChoice] = useState<boolean | null>(null);

  const handleSelect = (opt: AnswerOption) => {
    if (selected || isTimeout) return;
    setSelected(opt.text);
    const correct = opt.isCorrect === true;
    setIsCorrectChoice(correct);
    setAnimationTarget(opt.text);
    onAnswer(opt.text);

    if (!correct) {
      setShowCorrectHint(true);
      setTimeout(() => setShowCorrectHint(false), 1500);
    }
  };

  useEffect(() => {
    setSelected(null);
    setAnimationTarget(null);
    setIsCorrectChoice(null);
  }, [question._id]);

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  };

  const scaleAnimation = {
    scale: [1, 1.1, 1],
    transition: { duration: 0.3 },
  };

  return (
    <Card style={{ marginTop: 24 }} hoverable>
      <Title level={4}>{`Câu ${index + 1} / ${total}`}</Title>
      <p>{question.content}</p>
      <Space direction="vertical" style={{ width: "100%" }}>
        {question.options.map((opt, i) => {
          const isSelected = selected === opt.text;
          const highlightCorrect = showCorrectHint && opt.isCorrect && selected !== opt.text;
          const isCorrect = opt.isCorrect === true;

          const animationProps =
            isSelected && animationTarget === opt.text
              ? isCorrectChoice
                ? scaleAnimation
                : shakeAnimation
              : {};

          return (
            <motion.div key={opt.id} animate={animationProps}>
              <Button
                block
                size="large"
                type={
                  selected
                    ? isCorrect
                      ? "primary"
                      : isSelected
                      ? "primary"
                      : "default"
                    : highlightCorrect
                    ? "primary"
                    : "default"
                }
                icon={
                  selected
                    ? isCorrect
                      ? <CheckCircleTwoTone twoToneColor="#52c41a" />
                      : isSelected
                      ? <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                      : undefined
                    : highlightCorrect
                    ? <CheckCircleTwoTone twoToneColor="#52c41a" />
                    : undefined
                }
                danger={!!(selected && isSelected && !isCorrect)}
                disabled={!!selected || isTimeout}
                onClick={() => handleSelect(opt)}
                style={{
                  backgroundColor: highlightCorrect ? '#e6f7ff' : undefined,
                  borderColor: highlightCorrect ? '#1890ff' : undefined,
                  color: highlightCorrect ? '#1890ff' : undefined,
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                }}
              >
                {`${i + 1}. ${opt.text}`}
              </Button>
            </motion.div>
          );
        })}
      </Space>
    </Card>
  );
};

export default QuestionPlayer;
