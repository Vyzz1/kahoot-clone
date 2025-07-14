import { Table, Badge, type TableProps } from "antd";
import { format } from "date-fns";
import { useQuizFilter } from "../hooks/useQuizFilter";
import QuizForm from "./quiz-form";
import DeleteConfirm from "@/components/delete-confirm";
// import type { Quiz } from "@/types/types"


interface QuizTableProps {
  quizzes: Pagination<Quiz>;
  isLoading?: boolean;
}

export default function QuizTable({ quizzes, isLoading }: QuizTableProps) {
  const { sortBy, sortOrder, setFilters, statuses } = useQuizFilter();

  const columns: TableProps<Quiz>["columns"] = [
    {
      key: "title",
      title: "Title",
      dataIndex: "title",
    },
    {
      key: "visibility",
      title: "Visibility",
      dataIndex: "isPublic",
      render: (isPublic) => (
        <Badge
          status={isPublic ? "success" : "default"}
          text={isPublic ? "Public" : "Private"}
        />
      ),
      filters: [
        { text: "Public", value: true },
        { text: "Private", value: false },
      ],
      filteredValue: statuses,
    },
    {
      key: "createdAt",
      title: "Created At",
      dataIndex: "createdAt",
      sorter: true,
      sortOrder: sortBy === "createdAt" ? sortOrder : undefined,
      render: (createdAt) => format(new Date(createdAt), "PPP"),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <QuizForm isEdit initialValues={record} />
          <DeleteConfirm
            term={`quiz "${record.title}"`}
            endpoint={`/quizzes/${record._id}`}
            queryKey={["/quizzes"]}
            onDelete={() => {}}
          />
        </div>
      ),
    },
  ];

  const onChange: TableProps<Quiz>["onChange"] = (pagination, filters, sorter) => {
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;
    if (sortInfo.field || filters.isPublic) {
      setFilters({
        sortBy: sortInfo.field as string,
        sortOrder: sortInfo.order as "ascend" | "descend",
        currentPage: 1,
        pageSize: pagination.pageSize,
        statuses: filters.isPublic as string[],
      });
    } else {
      setFilters({
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
      });
    }
  };

  return (
    <Table<Quiz>
      rowKey={(quiz) => quiz._id.toString()}
      columns={columns}
      dataSource={quizzes?.data ?? []} 
      loading={isLoading}
      pagination={{
        total: quizzes.total,       
        current: quizzes.page + 1,      
        pageSize: quizzes.pageSize,
      }}
      onChange={onChange}
    />
  );
}
