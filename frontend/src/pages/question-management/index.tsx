import {
  Button,
  Flex,
  Space,
  Typography,
  Spin,
  Empty,
  Tag,
  Table,
  Dropdown,
  Modal,
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import useFetchData from "@/hooks/useFetchData";
import QuestionForm from "./_components/question-form";
import SearchQuestion from "./_components/search-question";
import deleteQuestionById from "./hooks/delete-confirm";
import { useQuestionFilter } from "./hooks/useQuestionFilter";
import type { Question, Quiz } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import type { TableProps } from "antd";
import { useState } from "react";
import type { Pagination } from "@/types/types";

const { Title } = Typography;

export default function QuestionManagement() {
  const { getParamsString, deleteAllFilters, shouldResetFilters } = useQuestionFilter();
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("quizId");

  const { data, isLoading, error } = useFetchData<Pagination<Question>>(
    `/questions?${getParamsString()}${quizId ? `&quizId=${quizId}` : ""}`,
    { type: "private" }
  );

  const { data: quizData } = useFetchData<Pagination<Quiz>>("/quizzes?type=private");
  const quizOptions = quizData?.content.map((q) => ({
    _id: q._id,
    title: q.title,
  })) ?? [];

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const handleAdd = () => {
    queryClient.invalidateQueries({ queryKey: ["/questions"] });
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleEdit = (record: Question) => {
    setEditingQuestion(record);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const columns: TableProps<Question>["columns"] = [
    {
      title: "Title",
      dataIndex: "content",
      key: "title",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag
          color={
            type === "multiple_choice"
              ? "blue"
              : type === "true_false"
              ? "green"
              : type === "poll"
              ? "gold"
              : type === "ordering"
              ? "purple"
              : "red"
          }
        >
          {type.replace("_", " ").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Time",
      dataIndex: "timeLimit",
      key: "timeLimit",
      render: (t: number) => `${t}s`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const items = [
          { key: "edit", label: "Edit" },
          { key: "delete", label: <span className="text-red-500">Delete</span> },
        ];

        const handleMenuClick = ({ key }: { key: string }) => {
          if (key === "edit") handleEdit(record);
          else if (key === "delete") {
            Modal.confirm({
              title: `Delete question "${record.title || "this question"}"?`,
              okText: "Yes",
              okType: "danger",
              cancelText: "Cancel",
              onOk: async () => {
                try {
                  await deleteQuestionById(record._id);
                  queryClient.invalidateQueries({ queryKey: ["/questions"] });
                } catch (err) {
                  console.error("Delete failed:", err);
                }
              },
            });
          }
        };

        return (
          <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
            <Button shape="circle" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <section className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
          <div>
            <Title level={3} className="m-0">🎯 Question Manager</Title>
            {quizId && (
              <span className="text-sm text-gray-500">
                For quiz: <strong>{quizOptions.find(q => q._id === quizId)?.title || quizId}</strong>
              </span>
            )}
          </div>
          <Space wrap>
            <Button onClick={() => navigate("/admin/quiz-management")}>
              Back to Quizzes
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Add Question
            </Button>
          </Space>
        </Flex>

        <Flex wrap gap="middle">
          <SearchQuestion />
          {shouldResetFilters && (
            <Button type="dashed" onClick={deleteAllFilters}>
              Reset Filters
            </Button>
          )}
        </Flex>

        <div className="bg-white shadow rounded-xl p-4">
          {isLoading ? (
            <div className="text-center py-16">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              {error.response?.data?.message || "Something went wrong"}
            </div>
          ) : data && data.content.length > 0 ? (
            <Table
              rowKey={(q) => q._id}
              columns={columns}
              dataSource={data.content}
              pagination={{
                total: data.totalCount,
                current: data.currentPage + 1,
                pageSize: data.pageSize,
              }}
            />
          ) : (
            <Empty description="No questions found." className="py-12" />
          )}
        </div>

        <Modal
          title={editingQuestion ? "Edit Question" : "Add Question"}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          destroyOnHidden
        >
          <QuestionForm
            quizId={editingQuestion?.quizId || quizId || ""}
            editingQuestion={editingQuestion || undefined}
            onAdd={handleAdd}
            quizOptions={quizOptions}
            disabledQuizSelect={!!quizId} 
          />
        </Modal>
      </div>
    </section>
  );
}
