import { Button, Empty, Flex, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import useFetchData from "@/hooks/useFetchData";
import QuizTable from "./_components/quiz-table";
import SearchQuiz from "./_components/search-quiz";
import QuizForm from "./_components/quiz-form";
import { useQuizFilter } from "./hooks/useQuizFilter";
import type { Quiz } from "@/types/types";

const { Title } = Typography;

export default function QuizManagement() {
  const navigate = useNavigate();
  const { getParamsString, shouldResetFilters, deleteAllFilters } = useQuizFilter();

  const { data, isLoading, error } = useFetchData<Pagination<Quiz>>(
    `/quizzes?${getParamsString()}`,
    {
      type: "private",
    }
  );

  return (
    <section className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
          <Title level={3} className="m-0">
            📚 Quiz Manager
          </Title>
          <Flex wrap gap="small">
            <Button onClick={() => navigate("/admin/quiz-builder")}>
              Go to Builder
            </Button>
            <Button onClick={() => navigate("/admin/question-management")}>
              Manage Questions
            </Button>
            <QuizForm isEdit={false} />
          </Flex>
        </Flex>

        {/* Filters */}
        <Flex wrap gap="middle">
          <SearchQuiz />
          {shouldResetFilters && (
            <Button type="dashed" onClick={deleteAllFilters}>
              Reset Filters
            </Button>
          )}
        </Flex>

        {/* Table or Loading/Error/Empty */}
        <div className="bg-white shadow rounded-xl p-4 min-h-[300px]">
          {isLoading ? (
            <div className="text-center py-16">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              {error.response?.data?.message || "Something went wrong"}
            </div>
          ) : data && data.data.length > 0 ? (
            <QuizTable quizzes={data} isLoading={isLoading} />
          ) : (
            <Empty description="No quizzes found." className="py-12" />
          )}
        </div>
      </div>
    </section>
  );
}
