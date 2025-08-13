import { Table, Tag, type TableProps, Dropdown, Button, Modal } from "antd";
import { useQuestionFilter } from "../hooks/useQuestionFilter";
// import QuestionForm from "./question-form";
// import DeleteConfirm from "@/components/delete-confirm";
import { MoreOutlined } from "@ant-design/icons";

interface QuestionTableProps {
  questions: Pagination<Question>;
  isLoading?: boolean;
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
  quizOptions: { _id: string; title: string }[];
}

export default function QuestionTable({
  questions,
  isLoading,
  onEdit,
  onDelete,
  quizOptions,
}: QuestionTableProps) {
  const { setFilters, page, pageSize, sortBy, sortOrder } = useQuestionFilter();

  const columns: TableProps<Question>["columns"] = [
    // ... (Giữ nguyên các cột STT, Content, Type, Time Limit, QuizId)
    {
      key: "stt",
      title: "STT",
      render: (text, record, index) =>
        (page ?? 0) * (pageSize ?? 10) + index + 1,
    },
    {
      key: "content",
      title: "Question Content",
      dataIndex: "content",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      sortOrder:
        sortBy === "content"
          ? (sortOrder === "asc" ? "ascend" : sortOrder === "desc" ? "descend" : undefined)
          : undefined,
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
      render: (_, record) => {
        const items = [
          { key: "edit", label: "Edit" },
          {
            key: "delete",
            label: <span className="text-red-500">Delete</span>,
          },
        ];

        const handleMenuClick = ({ key }: { key: string }) => {
          if (key === "edit") {
            onEdit(record);
          } else if (key === "delete") {
            Modal.confirm({
              title: `Are you sure you want to delete question "${
                record.content || "this question"
              }"?`,
              okText: "Yes",
              okType: "danger",
              cancelText: "No",
              onOk: () => onDelete(record._id),
            });
          }
        };

        return (
          <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
            <span>
              <Button shape="circle" icon={<MoreOutlined />} />
            </span>
          </Dropdown>
        );
      },
    },
  ];

  const onChange: TableProps<Question>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;

    setFilters({
      page: (pagination.current ?? 1) - 1,
      pageSize: pagination.pageSize,
      sortBy: sortInfo?.field ? String(sortInfo.field) : undefined,
      sortOrder:
        sortInfo?.order === "ascend"
          ? "asc"
          : sortInfo?.order === "descend"
          ? "desc"
          : undefined,
      type: filters.type ? (filters.type[0] as string) : undefined,
      quizId: filters.quizId ? (filters.quizId[0] as string) : undefined,
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
        current: (questions?.currentPage ?? 0) + 1,
        pageSize: questions?.pageSize ?? 10,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      }}
      onChange={onChange}
    />
  );
}