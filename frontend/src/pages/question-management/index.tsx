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
  Select,
  message, // Import message for notifications
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import useFetchData from "@/hooks/useFetchData";
import QuestionForm from "./_components/question-form";
import SearchQuestion from "./_components/search-question";
import { useDeleteQuestion } from "./hooks/delete-confirm"; 
import { useQuestionFilter } from "./hooks/useQuestionFilter";
import type { Question, Quiz } from "@/types/types";
import type { TableProps } from "antd";
import { useState } from "react";
import type { Pagination } from "@/types/types";

const { Title } = Typography;

export default function QuestionManagement() {
  const { getParamsString, deleteAllFilters, shouldResetFilters, setFilters, type } = useQuestionFilter(); // Removed page, pageSize from destructuring
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("quizId");

  // Fetch questions based on current filters and quizId
  const { data, isLoading, error, refetch } = useFetchData<Pagination<Question>>( // Add refetch
    `/questions?${getParamsString()}${quizId ? `&quizId=${quizId}` : ""}`,
    { type: "private" }
  );

  // Fetch quizzes for the dropdown in QuestionForm and for displaying quiz title
  const { data: quizData } = useFetchData<Pagination<Quiz>>("/quizzes?type=private");
  const quizOptions = quizData?.content.map((q) => ({
    _id: q._id,
    title: q.title,
  })) ?? [];

  const navigate = useNavigate();
  const { mutate: deleteQuestionMutate } = useDeleteQuestion(); // Use the delete hook

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Handlers for adding/editing questions
  const handleAdd = () => {
    refetch(); // Refetch questions after add/edit
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

  // Handle type filter change
  const handleTypeFilterChange = (value: string) => {
    setFilters({ type: value, page: 0 }); // Reset to first page when filtering
  };

  // Table columns definition
  const columns: TableProps<Question>["columns"] = [
    {
      key: "stt",
      title: "STT",
      render: (text, record, index) => (data?.currentPage ?? 0) * (data?.pageSize ?? 10) + index + 1, // Tính toán STT
    },
    {
      title: "Title", // Title column
      dataIndex: "content", // Use 'content' as dataIndex for question title
      key: "content",
      sorter: true, // Enable sorting by title
    },
    {
      title: "Type", // Type column
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
      title: "Time", // Time Limit column
      dataIndex: "timeLimit",
      key: "timeLimit",
      render: (t: number) => `${t}s`,
      sorter: true, // Enable sorting by time limit
    },
    {
      title: "Actions", // Actions column
      key: "actions",
      render: (_, record) => {
        const items = [
          { key: "edit", label: "Edit" }, // Edit option
          { key: "delete", label: <span className="text-red-500">Delete</span> }, // Delete option
        ];

        const handleMenuClick = ({ key }: { key: string }) => {
          if (key === "edit") handleEdit(record);
          else if (key === "delete") {
            Modal.confirm({
              title: `Are you sure you want to delete question "${record.content || "this question"}"?`, // Confirmation for deletion
              okText: "Yes",
              okType: "danger",
              cancelText: "No",
              onOk: () => {
                deleteQuestionMutate(record._id, {
                  onSuccess: () => {
                    message.success("Question deleted successfully!");
                    refetch(); // Refetch after successful deletion
                  },
                  onError: (err: any) => {
                    const errorMessage = err?.response?.data?.message || 'Failed to delete question.';
                    message.error(errorMessage);
                    console.error("Delete failed:", err);
                  },
                });
              },
            });
          }
        };

        // Define menuProps here
        const menuProps = { items, onClick: handleMenuClick };

        return (
          <Dropdown menu={menuProps} trigger={["click"]}>
            {/* The child of Dropdown must be a single React element */}
            <span>
              <Button shape="circle" icon={<MoreOutlined />} />
            </span>
          </Dropdown>
        );
      },
    },
  ];

  // Handle table change (pagination, sorting, filtering)
  const onChange: TableProps<Question>["onChange"] = (pagination, filters, sorter) => {
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;
    setFilters({
      sortBy: sortInfo?.field as string,
      sortOrder: sortInfo?.order === 'ascend' ? 'asc' : (sortInfo?.order === 'descend' ? 'desc' : undefined), // Map Ant Design sort order to backend
      page: (pagination.current ?? 1) - 1, // Chuyển đổi về page bắt đầu từ 0
      pageSize: pagination.pageSize,
    });
  };

  return (
    <section className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
          <div>
            <Title level={3} className="m-0">🎯 Question Management</Title>
            <p className="text-gray-600">
              Manage and reuse questions for multiple quizzes.
            </p>
            {quizId && (
              <span className="text-sm text-gray-500">
                For quiz: <strong>{quizOptions.find(q => q._id === quizId)?.title || "Unknown Quiz"}</strong>
              </span>
            )}
          </div>
          <Space wrap>
            <Button onClick={() => navigate("/admin/quiz-management")}>
              Back to Quiz Management
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => {
              setEditingQuestion(null); // Ensure no editing question is pre-filled
              setIsModalOpen(true);
            }}>
              Add New Question
            </Button>
          </Space>
        </Flex>

        <Flex wrap gap="middle" align="center">
          <SearchQuestion />
          <Select
            placeholder="Filter by type"
            style={{ width: 180 }}
            onChange={handleTypeFilterChange}
            allowClear
            value={type || undefined} // Control value from searchParams
          >
            <Select.Option value="multiple_choice">Multiple Choice</Select.Option>
            <Select.Option value="true_false">True/False</Select.Option>
            <Select.Option value="short_answer">Short Answer</Select.Option>
            <Select.Option value="ordering">Ordering</Select.Option>
            <Select.Option value="poll">Poll</Select.Option>
          </Select>
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
              {error.response?.data?.message || "Something went wrong!"}
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
                showSizeChanger: true, // Hiển thị tùy chọn thay đổi kích thước trang
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`, // Hiển thị tổng số mục
              }}
              onChange={onChange}
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
          destroyOnHidden={true} // Use destroyOnHidden to reset form on close
        >
          <QuestionForm
            quizId={editingQuestion?.quizId || quizId || ""}
            editingQuestion={editingQuestion} // Pass editingQuestion directly
            onAdd={handleAdd}
            quizOptions={quizOptions}
            disabledQuizSelect={!!quizId} // Vô hiệu hóa Select Quiz nếu quizId được truyền
          />
        </Modal>
      </div>
    </section>
  );
}
