import { Table, Tag, type TableProps } from "antd";
import { useQuestionFilter } from "../hooks/useQuestionFilter";
import QuestionForm from "./question-form";
import DeleteConfirm from "@/components/delete-confirm";
import type { Question, Pagination } from "@/types/types";

interface QuestionTableProps {
  questions: Pagination<Question>;
  isLoading?: boolean;
  onAdd?: (q: Question) => void;
  quizOptions: { _id: string; title: string }[];
}

export default function QuestionTable({
  questions,
  isLoading,
  onAdd,
  quizOptions,
}: QuestionTableProps) {
  const { setFilters/* , page, pageSize */ } = useQuestionFilter(); // Lấy page và pageSize từ hook

  const columns: TableProps<Question>["columns"] = [
    {
      key: "stt",
      title: "STT",
      render: (text, record, index) => (questions.currentPage ?? 0) * (questions.pageSize ?? 10) + index + 1, // Tính toán STT
    },
    {
      key: "title",
      title: "Title",
      dataIndex: "content", // Sử dụng 'content' cho tiêu đề câu hỏi
    },
    {
      key: "type",
      title: "Type",
      dataIndex: "type",
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      key: "timeLimit",
      title: "Time Limit",
      dataIndex: "timeLimit",
      render: (t) => `${t}s`,
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <QuestionForm
            quizId={record.quizId}
            editingQuestion={record}
            onAdd={onAdd || (() => {})}
            quizOptions={quizOptions} 
          />
          <DeleteConfirm
            term={`question "${record.title}"`}
            endpoint={`/questions/${record._id}`}
            queryKey={["/questions"]}
          />
        </div>
      ),
    },
  ];

  const onChange: TableProps<Question>["onChange"] = (pagination, filters, sorter) => {
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;
    setFilters({
      sortBy: sortInfo?.field as string,
      sortOrder: sortInfo?.order as "ascend" | "descend",
      page: (pagination.current ?? 1) - 1, // Chuyển đổi về page bắt đầu từ 0
      pageSize: pagination.pageSize,
    });
  };

  return (
    <Table<Question>
      rowKey={(q) => q._id}
      columns={columns}
      dataSource={questions.content}
      loading={isLoading}
      pagination={{
        total: questions.totalCount,
        current: questions.currentPage + 1, // backend trả về page bắt đầu từ 0
        pageSize: questions.pageSize,
        showSizeChanger: true, // Hiển thị tùy chọn thay đổi kích thước trang
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`, // Hiển thị tổng số mục
      }}
      onChange={onChange}
    />
  );
}
