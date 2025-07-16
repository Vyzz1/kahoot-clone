import { Table, Badge, type TableProps, Tooltip, Button } from "antd";
import { format } from "date-fns";
import { useQuizFilter } from "../hooks/useQuizFilter";
import QuizForm from "./quiz-form";
import DeleteConfirm from "@/components/delete-confirm";
import type { Quiz, Pagination } from "@/types/types";
import { useNavigate } from "react-router-dom";
import {  EyeOutlined } from "@ant-design/icons"; // Import icons

interface QuizTableProps {
  quizzes: Pagination<Quiz>;
  isLoading?: boolean;
}

export default function QuizTable({ quizzes, isLoading }: QuizTableProps) {
  const { setFilters, page, pageSize } = useQuizFilter();
  const navigate = useNavigate();

  const columns: TableProps<Quiz>["columns"] = [
    {
      key: "title",
      title: "Title", // Changed to English
      dataIndex: "title",
      render: (text, record) => (
        <span
          className="text-blue-600 hover:underline cursor-pointer font-medium"
          onClick={(e) => {
            e.stopPropagation(); // Prevent interfering with other behaviors
            navigate(`/admin/question-management?quizId=${record._id}`);
          }}
        >
          {text}
        </span>
      ),
    },
    {
      key: "isPublic",
      title: "Visibility", // Changed to English
      dataIndex: "isPublic",
      render: (isPublic) => (
        <Badge
          status={isPublic ? "success" : "default"}
          text={isPublic ? "Public" : "Private"} // Changed to English
        />
      ),
    },
    {
      key: "createdAt",
      title: "Created At", // Changed to English
      dataIndex: "createdAt",
      render: (createdAt) => format(new Date(createdAt), "PPP"),
    },
    {
      key: "actions",
      title: "Actions", // Changed to English
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {/* Edit Button - opens QuizForm in a modal */}
          <QuizForm isEdit initialValues={record} />
          {/* View Questions Button */}
          <Tooltip title="View Questions"> {/* Changed tooltip to English */}
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/question-management?quizId=${record._id}`);
              }}
              className="rounded-md shadow-sm hover:shadow-md transition-all"
            />
          </Tooltip>
          {/* Delete Button */}
          <DeleteConfirm
            term={`quiz "${record.title}"`}
            endpoint={`/quizzes/${record._id}`}
            queryKey={["/quizzes"]}
            onDelete={() => {}} // onDelete is typically used for local state updates, but here queryClient.invalidateQueries handles refetch
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
      rowKey={(quiz) => quiz._id.toString()} // Ensure rowKey is a string
      columns={columns}
      dataSource={quizzes?.content ?? []}
      loading={isLoading}
      pagination={{
        total: quizzes?.totalCount ?? 0,
        current: (page ?? 0) + 1,
        pageSize: pageSize ?? 10,
        showSizeChanger: true, // Allow changing page size
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`, // Show total items
      }}
      onChange={onChange}
      className="rounded-xl overflow-hidden shadow-md" // Tailwind classes for table styling
    />
  );
}
