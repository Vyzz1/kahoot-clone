import { Table, Tag, type TableProps } from "antd";
import { useQuestionFilter } from "../hooks/useQuestionFilter";
import QuestionForm from "./question-form";
import DeleteConfirm from "@/components/delete-confirm"; // Đảm bảo import DeleteConfirm
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
  const { setFilters, page, pageSize, sortBy, sortOrder } = useQuestionFilter(); // Lấy page, pageSize, sortBy, sortOrder từ hook

  const columns: TableProps<Question>["columns"] = [
    {
      key: "stt",
      title: "STT",
      // Sử dụng page và pageSize từ useQuestionFilter để tính toán STT chính xác
      render: (text, record, index) =>
        (page ?? 0) * (pageSize ?? 10) + index + 1,
    },
    {
      key: "content",
      title: "Question Content",
      dataIndex: "content",
      sorter: true, // Bật chức năng sắp xếp
      sortDirections: ["ascend", "descend"],
      sortOrder: sortBy === "content" ? sortOrder : undefined, // Đặt trạng thái sắp xếp
    },
    {
      key: "type",
      title: "Type",
      dataIndex: "type",
      render: (type) => <Tag>{type}</Tag>,
      filters: [
        { text: "Multiple Choice", value: "multiple_choice" },
        { text: "True/False", value: "true_false" },
        { text: "Ordering", value: "ordering" },
        { text: "Short Answer", value: "short_answer" },
        { text: "Poll", value: "poll" },
      ],
      onFilter: (value, record) => record.type.indexOf(value as string) === 0,
    },
    {
      key: "timeLimit",
      title: "Time Limit",
      dataIndex: "timeLimit",
    },
    {
      key: "quizId", 
      title: "Quiz",
      dataIndex: "quizId", 
      render: (quizId) => {
        const quiz = quizOptions.find((opt) => opt._id === quizId);
        return quiz ? quiz.title : "N/A";
      },
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
            term={`question "${record.content}"`} // Dùng content thay vì title
            endpoint={`/questions/${record._id}`}
            queryKey={["/questions"]}
          />
        </div>
      ),
    },
  ];

  const onChange: TableProps<Question>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;

    setFilters({
      page: (pagination.current ?? 1) - 1, // Chuyển đổi về page bắt đầu từ 0
      pageSize: pagination.pageSize,
      sortBy: sortInfo?.field ? String(sortInfo.field) : undefined, // Chắc chắn là string hoặc undefined
      sortOrder: sortInfo?.order as "asc" | "desc" | undefined,
      type: filters.type ? (filters.type[0] as string) : undefined, // Lấy giá trị filter type đầu tiên
      quizId: filters.quizId ? (filters.quizId[0] as string) : undefined, // Lấy quizId từ filter
    });
  };

  return (
    <Table<Question>
      rowKey={(q) => q._id}
      columns={columns}
      dataSource={questions.content}
      loading={isLoading}
      pagination={{
        total: questions?.totalCount ?? 0,
        current: (questions?.currentPage ?? 0) + 1, // Use questions.currentPage from props
        pageSize: questions?.pageSize ?? 10, // Use questions.pageSize from props
        showSizeChanger: true, // Hiển thị tùy chọn thay đổi kích thước trang
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`, // Hiển thị tổng số mục
      }}
      onChange={onChange} 
    />
  );
}
