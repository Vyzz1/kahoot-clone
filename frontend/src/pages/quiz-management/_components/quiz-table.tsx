import { Table, Badge, type TableProps, Tooltip, Button } from "antd";
import { format } from "date-fns";
import { useQuizFilter } from "../hooks/useQuizFilter";
import QuizForm from "./quiz-form";
import DeleteConfirm from "@/components/delete-confirm";
import type { Quiz, Pagination, Question } from "@/types/types";
import { useNavigate } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";

interface QuizTableProps {
  quizzes: Pagination<Quiz>;
  isLoading?: boolean;
  currentQueryKey: string; // ✅ Thêm prop này để truyền queryKey hiện tại
}

export default function QuizTable({ quizzes, isLoading, currentQueryKey }: QuizTableProps) {
  const { setFilters, page, pageSize } = useQuizFilter();
  const navigate = useNavigate();

  const columns: TableProps<Quiz>["columns"] = [
    {
      key: "stt",
      title: "STT",
      render: (text, record, index) => (page ?? 0) * (pageSize ?? 10) + index + 1,
    },
    {
      key: "title",
      title: "Title",
      dataIndex: "title",
      render: (text, record) => (
        <span
          className="text-blue-600 hover:underline cursor-pointer font-medium"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/question-management?quizId=${record._id}`);
          }}
        >
          {text}
        </span>
      ),
    },
    {
      key: "isPublic",
      title: "Visibility",
      dataIndex: "isPublic",
      render: (isPublic) => (
        <Badge
          status={isPublic ? "success" : "error"}
          text={isPublic ? "Public" : "Private"}
        />
      ),
    },
    {
      key: "questionCount",
      title: "Questions",
      dataIndex: "questions",
      render: (questions: Question[]) => Array.isArray(questions) ? questions.length : 0,
    },
    {
      key: "createdAt",
      title: "Created At",
      dataIndex: "createdAt",
      render: (createdAt) => format(new Date(createdAt), "PPP"),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <QuizForm isEdit initialValues={record} isDisabled={isLoading} currentQueryKey={currentQueryKey} /> {/* ✅ Truyền currentQueryKey */}
          <Tooltip title="View Questions">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/question-management?quizId=${record._id}`);
              }}
              className="rounded-md shadow-sm hover:shadow-md transition-all"
              disabled={isLoading}
            />
          </Tooltip>
          <DeleteConfirm
            term={`quiz "${record.title}"`}
            endpoint={`/quizzes/${record._id}`}
            queryKey={[currentQueryKey]} // ✅ Sử dụng currentQueryKey để invalidate
            onDelete={() => {}}
          />
        </div>
      ),
    },
  ];

  const onChange: TableProps<Quiz>["onChange"] = (pagination) => {
    setFilters({
      page: (pagination.current ?? 1) - 1,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <Table<Quiz>
      rowKey={(quiz) => quiz._id.toString()}
      columns={columns}
      dataSource={quizzes?.content ?? []}
      loading={isLoading}
      pagination={{
        total: quizzes?.totalCount ?? 0,
        current: (page ?? 0) + 1,
        pageSize: pageSize ?? 10,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      }}
      onChange={onChange}
      className="rounded-xl overflow-hidden shadow-md"
    />
  );
}