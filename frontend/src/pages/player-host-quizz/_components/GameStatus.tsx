import React from "react";
import { Card, Typography, Tag } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface GameStatusProps {
  gameState?: any;
  isFinished?: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({ gameState, isFinished }) => {
  return (
    <Card size="small" className="text-center border-gray-200">
      {isFinished || gameState?.status === "finished" ? (
        <div className="space-y-2">
          <CheckCircleOutlined className="text-4xl text-green-500" />
          <Text className="text-lg font-semibold text-green-600 block">
            Game Complete!
          </Text>
          <Tag color="green">Final Results</Tag>
        </div>
      ) : (
        <div className="space-y-2">
          <ClockCircleOutlined className="text-3xl text-blue-500" />
          <Text className="text-gray-600 block">
            Waiting for next question...
          </Text>
          <Tag color="blue">Game in Progress</Tag>
        </div>
      )}
    </Card>
  );
};

export default GameStatus;
