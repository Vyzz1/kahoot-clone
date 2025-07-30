import useSubmitData from "@/hooks/useSubmitData";
import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";

interface HostQuizzButtonProps {
  quizzId: string;
}

function HostQuizzButton({ quizzId }: HostQuizzButtonProps) {
  const navigate = useNavigate();
  const { mutate, isPending } = useSubmitData(
    "/game/create-game",
    (data: any) => {
      message.success("Quiz hosted successfully");
      navigate(`/owner-host-quizz?gameId=${data._id}`);
    },
    () => {
      message.error("Failed to host quiz");
    }
  );
  const handleHostQuiz = () => {
    mutate({ data: { quizzId }, type: "post" });
  };
  return (
    <Button
      size="small"
      loading={isPending}
      type="primary"
      onClick={handleHostQuiz}
    >
      Host Quizz
    </Button>
  );
}

export default HostQuizzButton;
