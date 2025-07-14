import { Table, Tag, type TableProps } from "antd";
import { useQuestionFilter } from "../hooks/useQuestionFilter";
import QuestionForm from "./question-form";
import DeleteConfirm from "@/components/delete-confirm";
import type { Question } from "@/types/types";

interface QuestionTableProps {
  questions: Pagination<Question>;
  isLoading?: boolean;
  onAdd?: (q: Question) => void;
}

export default function QuestionTable({ questions, isLoading, onAdd }: QuestionTableProps) {
  const { setFilters } = useQuestionFilter();

  const columns: TableProps<Question>["columns"] = [
    {
      key: "title",
      title: "Title",
      dataIndex: "title",
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
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <Table<Question>
      rowKey={(q) => q._id}
      columns={columns}
      dataSource={questions.data}
      loading={isLoading}
      pagination={{
        total: questions.total,
        current: questions.page + 1, // backend trả về page bắt đầu từ 0
        pageSize: questions.pageSize,
      }}
      onChange={onChange}
    />
  );
}
