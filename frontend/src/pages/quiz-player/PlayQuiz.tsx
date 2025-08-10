import { useEffect, useState, useRef } from "react";
import { Typography, Button, Spin, Progress, Result, List, notification, Skeleton, Space, Input } from "antd";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import QuestionPlayer from "./QuestionPlayer";
import { useQuizQuestions } from "../quiz-player/hooks/useQuizQuestions";
import { submitQuizResult } from "@/services/quiz.service";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface AnswerDetail {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  score: number;
  correctCount?: number;
  totalCount?: number;
}

const normalizeVietnameseString = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
};

const checkOrderingAnswer = (question: any, answer: string | null) => {
  if (!answer) return { isFullyCorrect: false, correctCount: 0, totalCount: question.correctOrder.length };

  const userLines = answer.split("\n").map(line => normalizeVietnameseString(line.trim()));
  const correctLines = question.correctOrder.map((line: string) => normalizeVietnameseString(line.trim()));

  const correctCount = userLines.reduce((acc, line, i) => acc + (line === correctLines[i] ? 1 : 0), 0);
  const isFullyCorrect = correctCount === correctLines.length;

  return { isFullyCorrect, correctCount, totalCount: correctLines.length };
};

const PlayQuizPage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const axiosPrivate = useAxiosPrivate({ type: "private" });

  const { data: quizRes, isLoading: isLoadingQuizId } = useQuery({
    queryKey: ["game-quiz-id", gameId],
    queryFn: async () => {
      const res = await axiosPrivate.get(`/game/${gameId}/quiz-id`);
      console.log("📥 quizRes:", res.data);
      return res.data;
    },
    enabled: !!gameId,
  });



  const quizId = quizRes?.quizId;

  const { data: questions, isLoading, isError, error } = useQuizQuestions(quizId || "");
  const [lastAnswerStatus, setLastAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerDetail[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [questionStart, setQuestionStart] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingNext, setLoadingNext] = useState(false);
  const [userInput, setUserInput] = useState<string>("");

  const correctSound = useRef(new Audio("/sounds/correct.mp3"));
  const wrongSound = useRef(new Audio("/sounds/wrong.mp3"));
  const timeoutSound = useRef(new Audio("/sounds/timeout.mp3"));
  const backgroundMusic = useRef(new Audio("/sounds/background.mp3"));

  useEffect(() => {
    const unlockAudio = () => {
      if (backgroundMusic.current.paused) {
        backgroundMusic.current.play().catch(() => {});
      }
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, []);

  useEffect(() => {
    backgroundMusic.current.loop = true;
    backgroundMusic.current.volume = 0.3;

    if (questions && questions.length > 0 && !startTime) {
      setStartTime(Date.now());
      setQuestionStart(Date.now());
      backgroundMusic.current.play().catch(() => {});
    }

    return () => {
      backgroundMusic.current.pause();
    };
  }, [questions, startTime]);

  useEffect(() => {
    if (!finished && questions && questions.length > 0 && questions[currentIndex]) {
      const currentTimeLimit = questions[currentIndex]?.timeLimit || 15;
      setTimeLeft(currentTimeLimit);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentIndex, finished, questions]);

  const handleTimeout = () => {
    if (finished || currentIndex >= (questions?.length || 0)) return;
    timeoutSound.current.play().catch(() => {});
    saveAnswer(null);
    setTimeout(() => handleNext(), 1000);
  };

  const isAnswerCorrect = (question: any, answer: string | null) => {
    if (!question || !question.type) return false;
    if (question.type === "ordering") {
      return checkOrderingAnswer(question, answer);
    }
    if (!answer) return false;

    if (question.type === "short_answer") {
      return normalizeVietnameseString(answer) === normalizeVietnameseString(question.answerText);
    } else if (["multiple_choice", "true_false", "poll"].includes(question.type)) {
      const correctOption = question.options?.find((opt: any) => opt.isCorrect);
      return correctOption?.text === answer;
    }
    return false;
  };

  const calculateScore = (timeTaken: number, isCorrect: boolean, points: number, timeLimit: number) => {
    if (!isCorrect) return 0;
    const timeRatio = Math.max(0, 1 - timeTaken / (timeLimit * 1000));
    return Math.round(points * (0.5 + 0.5 * timeRatio));
  };

  const saveAnswer = (answer: string | null) => {
    if (!questions || currentIndex >= questions.length) return;
    const question = questions[currentIndex];
    if (!question) return;
    const now = Date.now();
    const timeTaken = now - (questionStart ?? now);

    let isCorrect: boolean = false;
    let correctCount = 0;
    let totalCount = 0;

    if (question.type === "ordering") {
      const result = checkOrderingAnswer(question, answer);
      isCorrect = result.isFullyCorrect;
      correctCount = result.correctCount;
      totalCount = result.totalCount;
    } else {
      isCorrect = isAnswerCorrect(question, answer) as boolean;
    }

    const correctOption = question.options?.find((opt: any) => opt.isCorrect);
    const correctAnswerText = correctOption?.text || question.answerText || question.correctOrder?.join("\n") || "";

    const questionScore = question.type === "ordering"
      ? Math.round((question.points || 10) * (correctCount / totalCount))
      : calculateScore(timeTaken, isCorrect, question.points || 10, question.timeLimit || 15);

    const currentAnswer: AnswerDetail = {
      questionId: question._id,
      selectedAnswer: answer || "Không trả lời",
      correctAnswer: correctAnswerText,
      isCorrect,
      timeTaken,
      score: questionScore,
      correctCount,
      totalCount,
    };

    setAnswers((prev) => [...prev, currentAnswer]);
    setScore((prev) => prev + questionScore);

    if (answer !== null) {
      const sound = isCorrect ? correctSound.current : wrongSound.current;
      sound.pause();
      sound.currentTime = 0;
      sound.play().catch(() => {});
      setLastAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    }
  };

  const handleAnswer = (answer: string) => {
    if (answers[currentIndex]) return;
    saveAnswer(answer);
  };

  const handleNext = () => {
    setLastAnswerStatus(null);
    if (currentIndex + 1 < (questions?.length || 0)) {
      setLoadingNext(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setQuestionStart(Date.now());
        setUserInput("");
        setLoadingNext(false);
      }, 1000);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    backgroundMusic.current.pause();
    setFinished(true);
    const totalTime = Date.now() - (startTime ?? Date.now());
    submitQuizResult(quizId || "", { answers, totalTime });
    notification.success({
      message: "Hoàn thành Quiz!",
      description: `Bạn đạt ${score} điểm (${answers.filter((a) => a.isCorrect).length}/${questions?.length} câu đúng).`,
    });
  };

  if (isLoadingQuizId) return <Spin fullscreen tip="Đang lấy quiz..." />;
  if (!quizId) return <div>Không tìm thấy quizId từ gameId.</div>;
  if (isLoading) return <Spin fullscreen tip="Đang tải quiz..." />;
  if (isError) return <div>Lỗi: {error?.message || "Không thể tải quiz."}</div>;
  if (!questions || questions.length === 0) return <div>Không tìm thấy câu hỏi nào cho quiz này.</div>;

  const question = questions?.[currentIndex];
  if (!question) return <div>Câu hỏi hiện tại không tồn tại.</div>;

  const currentTimeLimit = question?.timeLimit || 15;
  const progressPercent = Math.round(((currentIndex + (finished ? 1 : 0)) / questions.length) * 100);
  const circleColor = timeLeft > currentTimeLimit / 2 ? "#52c41a" : timeLeft > currentTimeLimit / 3 ? "#faad14" : "#ff4d4f";


  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Quiz</Title>
      <Progress percent={progressPercent} status={finished ? "success" : "active"} />

      {!finished ? (
        <>
          <Space style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <Progress
              type="circle"
              percent={(timeLeft / currentTimeLimit) * 100}
              format={() => `${timeLeft}s`}
              strokeColor={circleColor}
              size={80}
            />
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Điểm hiện tại: {score}</Text>
          </Space>

          <AnimatePresence mode="wait">
            {loadingNext ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <motion.div
                key={currentIndex}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <QuestionPlayer
                  question={question}
                  index={currentIndex}
                  total={questions.length}
                  onAnswer={handleAnswer}
                  selectedAnswer={answers[currentIndex]?.selectedAnswer}
                  isTimeout={timeLeft === 0}
                />
                {(question.type === "short_answer" || question.type === "ordering") && !answers[currentIndex] && (
                  <div style={{ marginTop: 16 }}>
                    <TextArea
                      rows={3}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={question.type === "ordering" ? "Nhập đúng thứ tự, mỗi dòng 1 mục" : "Nhập câu trả lời"}
                    />
                    <Button type="primary" onClick={() => handleAnswer(userInput)} style={{ marginTop: 8 }}>
                      Gửi đáp án
                    </Button>
                    {lastAnswerStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'inline-block', marginLeft: 10 }}
                      >
                        {lastAnswerStatus === 'correct' ? (
                          <CheckCircleTwoTone twoToneColor="#52c41a" />
                        ) : (
                          <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button type="primary" onClick={handleNext} disabled={!answers[currentIndex]}>
              {currentIndex + 1 < questions.length ? "Câu tiếp theo" : "Hoàn thành"}
            </Button>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 24 }}>
          <Result
            status="success"
            title="✅ Hoàn thành Quiz!"
            subTitle={`Bạn đạt ${score} điểm (${answers.filter((a) => a.isCorrect).length}/${questions.length} câu đúng).`}
          />
          <List
            header={<div>Lịch sử trả lời</div>}
            bordered
            dataSource={answers}
            renderItem={(a, i) => (
              <List.Item>
                <div style={{ width: "100%" }}>
                  <Text strong>Câu {i + 1}:</Text> {questions[i]?.content}
                  <br />
                  {a.isCorrect ? (
                    <Text type="success">
                      <CheckCircleTwoTone twoToneColor="#52c41a" /> Đúng
                    </Text>
                  ) : (
                    <Text type="danger">
                      <CloseCircleTwoTone twoToneColor="#ff4d4f" /> Sai
                    </Text>
                  )}
                  <br />
                  {questions[i].type === 'ordering' ? (
                    <>
                      {typeof a.correctCount === 'number' && (
                        <>
                          <Text>
                            🎯 Số dòng đúng: <Text strong>{a.correctCount}/{a.totalCount}</Text>
                          </Text>
                          <br />
                        </>
                      )}
                      <Text>Đáp án của bạn:</Text>
                      <List
                        size="small"
                        dataSource={a.selectedAnswer.split("\n")}
                        renderItem={(item, idx) => (
                          <List.Item style={{ padding: "4px 0" }}>
                            <Text>{idx + 1}. {item}</Text>
                          </List.Item>
                        )}
                      />
                      <Text>Đáp án đúng:</Text>
                      <List
                        size="small"
                        dataSource={a.correctAnswer.split("\n")}
                        renderItem={(item, idx) => (
                          <List.Item style={{ padding: "4px 0" }}>
                            <Text>{idx + 1}. {item}</Text>
                          </List.Item>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <Text>Đáp án của bạn:</Text> <Text strong>{a.selectedAnswer}</Text>
                      <br />
                      <Text>Đáp án đúng:</Text> <Text strong>{a.correctAnswer}</Text>
                    </>
                  )}
                  <br />
                  ⏱ {Math.round(a.timeTaken / 1000)} giây | Điểm: {a.score}
                </div>
              </List.Item>
            )}
          />
          <Button type="primary" href="/quizzes" style={{ marginTop: 16 }}>
            Quay về danh sách Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlayQuizPage;
