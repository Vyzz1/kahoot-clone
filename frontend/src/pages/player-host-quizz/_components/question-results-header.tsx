import React from "react";
import { Typography } from "antd";
import { BarChartOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface QuestionResultsHeaderProps {
  questionIndex?: number;
}

const QuestionResultsHeader: React.FC<QuestionResultsHeaderProps> = ({
  questionIndex,
}) => {
  return (
    <div className="text-center mb-6">
      <Title level={2} className="mb-0 flex items-center justify-center gap-2">
        <BarChartOutlined className="text-blue-500" />
        Question {questionIndex !== undefined ? questionIndex + 1 : ""} Results
      </Title>
    </div>
  );
};

export default QuestionResultsHeader;
