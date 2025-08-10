import { Badge, Table, Avatar, Button, type TableProps } from "antd";
import { format } from "date-fns";
import { getDefaultSorter } from "@/lib/utils";
import { useGamePlayedFilter } from "../_hooks/useGamePlayedFilter";
import { useNavigate } from "react-router-dom";

interface GamePlayedTableProps {
  data: PaginationGamePlayed;
  isLoading?: boolean;
}

export default function GamePlayedTable({
  data,
  isLoading,
}: GamePlayedTableProps) {
  const navigate = useNavigate();
  const { statuses, sortBy, sortOrder, setFilters } = useGamePlayedFilter();

  const columns: TableProps<GamePlayed>["columns"] = [
    {
      key: "quiz",
      title: "Quiz",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{record.quiz.title}</span>
          <span className="text-sm text-gray-500">
            {record.quiz.description}
          </span>
        </div>
      ),
    },
    {
      key: "pin",
      title: "Game PIN",
      dataIndex: "pin",
      render: (pin) => (
        <span className="font-mono font-semibold text-lg text-blue-600">
          {pin}
        </span>
      ),
    },
    {
      key: "host",
      title: "Host",
      render: (_, record) => {
        const host = Array.isArray(record.host) ? record.host[0] : record.host;
        return (
          <div className="flex items-center gap-3">
            <Avatar src={host?.avatar} alt={host?.fullName}>
              {host?.fullName?.charAt(0)}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {host?.fullName}
              </span>
              <span className="text-sm text-gray-500">{host?.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const statusConfig = {
          waiting: { color: "orange", text: "Waiting" },
          in_progress: { color: "blue", text: "In Progress" },
          finished: { color: "green", text: "Finished" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || {
          color: "default",
          text: status,
        };

        return <Badge color={config.color} text={config.text} />;
      },
      filters: [
        { text: "Waiting", value: "waiting" },
        { text: "In Progress", value: "in_progress" },
        { text: "Finished", value: "finished" },
      ],
      filteredValue: statuses,
    },
    {
      key: "createdAt",
      title: "Created",
      dataIndex: "createdAt",
      sorter: true,
      render: (createdAt) => format(new Date(createdAt), "PPP"),
      ...getDefaultSorter({
        refField: sortBy,
        fieldName: "createdAt",
        sortOrder: sortOrder,
      }),
    },
    {
      key: "startedAt",
      title: "Started",
      dataIndex: "startedAt",
      sorter: true,
      render: (startedAt) => {
        if (!startedAt) return "Not started";
        return format(new Date(startedAt), "PPPpp");
      },
      ...getDefaultSorter({
        refField: sortBy,
        fieldName: "startedAt",
        sortOrder: sortOrder,
      }),
    },
    {
      key: "finishedAt",
      title: "Finished",
      dataIndex: "finishedAt",
      sorter: true,
      render: (finishedAt) => {
        if (!finishedAt) return "Not finished";
        return format(new Date(finishedAt), "PPPpp");
      },
      ...getDefaultSorter({
        refField: sortBy,
        fieldName: "finishedAt",
        sortOrder: sortOrder,
      }),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            size="small"
            type="primary"
            onClick={() => navigate(`/game-played/${record._id}/results`)}
          >
            View Results
          </Button>
        </div>
      ),
    },
  ];

  const onChange: TableProps<GamePlayed>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;
    const sortDirection = sortInfo.order;

    setFilters({
      sortBy: sortInfo.field as keyof GamePlayed,
      sortOrder: sortDirection as "ascend" | "descend",
      pageSize: pagination.pageSize,
      currentPage: pagination.current,
      statuses: filters.status as string[],
    });
  };

  return (
    <Table<GamePlayed>
      rowKey={(record) => record._id.toString()}
      columns={columns}
      onChange={onChange}
      loading={isLoading}
      dataSource={data?.content || []}
      pagination={{
        total: data?.totalCount,
        current: data?.currentPage,
        pageSize: data?.pageSize,
      }}
    />
  );
}
