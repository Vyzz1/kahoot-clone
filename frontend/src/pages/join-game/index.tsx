import useSubmitData from "@/hooks/useSubmitData";
import { Button, Form, Input, message } from "antd";
import Title from "antd/es/typography/Title";
import { useNavigate } from "react-router-dom";

function JoinGamePage() {
  const navigate = useNavigate();

  const { mutate, isPending } = useSubmitData(
    "/game/pin",
    (data: any) => {
      navigate(`/player-host-quizz?gameId=${data._id}`);
    },
    (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while joining the game.";

      message.error(errorMessage);
    }
  );
  const handleFinish = (values: any) => {
    mutate({ data: { pin: values.gamePin }, type: "post" });
  };
  return (
    <section className="px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Title>Join a Game</Title>
        <p className="mb-4">
          To join a game, please enter the game PIN provided by the host.
        </p>
        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Game PIN"
            name="gamePin"
            rules={[{ required: true, message: "Please input the game PIN!" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Button
            loading={isPending}
            type="primary"
            htmlType="submit"
            className="w-full"
          >
            Join Game
          </Button>
        </Form>
      </div>
    </section>
  );
}

export default JoinGamePage;
