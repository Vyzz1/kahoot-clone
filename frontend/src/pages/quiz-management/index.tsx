import { Button, Empty, Flex, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import useFetchData from "@/hooks/useFetchData";
import QuizTable from "./_components/quiz-table";
import SearchQuiz from "./_components/search-quiz";
import QuizForm from "./_components/quiz-form";
import { useQuizFilter } from "./hooks/useQuizFilter";
import type { Pagination, Quiz } from "@/types/types";

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
    <section className="p-0 bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto space-y-8 p-4 md:p-6">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="bg-white p-6 rounded-xl shadow-md">
          <Title level={3} className="m-0 text-gray-800">
            📚 Quiz Management
          </Title>
          <Flex wrap gap="small">
            <Button
              onClick={() => navigate("/admin/quiz-builder")}
              className="rounded-md shadow-sm hover:shadow-md transition-all"
            >
              Go to Builder
            </Button>
            <Button
              onClick={() => navigate("/admin/question-management")}
              className="rounded-md shadow-sm hover:shadow-md transition-all"
            >
              Manage Questions
            </Button>
            <QuizForm isEdit={false} />
          </Flex>
        </Flex>

        {/* Filters */}
        <Flex wrap gap="middle" className="bg-white p-4 rounded-xl shadow-md">
          <SearchQuiz />
          {shouldResetFilters && (
            <Button
              type="dashed"
              onClick={deleteAllFilters}
              className="rounded-md shadow-sm hover:shadow-md transition-all"
            >
              Reset Filters
            </Button>
          )}
        </Flex>

        {/* Table or Loading/Error/Empty */}
        <div className="bg-white shadow rounded-xl p-4 min-h-[300px]">
          {isLoading ? (
            <div className="text-center py-16">
              <Spin size="large" tip="Loading Quizzes..." />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-16">
              {error.response?.data?.message || "Failed to load quizzes!"}
            </div>
          ) : data && data.content.length > 0 ? (
            <QuizTable quizzes={data} isLoading={isLoading} />
          ) : (
            <Empty description="No quizzes found." className="py-12" />
          )}
        </div>
      </div>
    </section>
  );
}
