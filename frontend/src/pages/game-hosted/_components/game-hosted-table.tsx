import { Badge, Table, Avatar, type TableProps } from "antd";
import { format } from "date-fns";
import { getDefaultSorter } from "@/lib/utils";
import { useGameHostedFilter } from "../_hooks/useGameHostedFilter";

interface GameHostedTableProps {
  data: PaginationGameHosted;
  isLoading?: boolean;
}

export default function GameHostedTable({
  data,
  isLoading,
}: GameHostedTableProps) {
  const { statuses, sortBy, sortOrder, setFilters } = useGameHostedFilter();

  const columns: TableProps<GameHosted>["columns"] = [
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
      key: "players",
      title: "Players",
      dataIndex: "players",
      render: (players) => (
        <div className="flex items-center gap-2">
          <Avatar.Group maxCount={3} size="small">
            {players.map((player: any, index: number) => (
              <Avatar key={index} src={player.avatar} alt={player.fullName}>
                {player.fullName.charAt(0)}
              </Avatar>
            ))}
          </Avatar.Group>
          <span className="text-sm text-gray-600">
            {players.length} player{players.length !== 1 ? "s" : ""}
          </span>
        </div>
      ),
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
  ];

  const onChange: TableProps<GameHosted>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;
    const sortDirection = sortInfo.order;

    setFilters({
      sortBy: sortInfo.field as keyof GameHosted,
      sortOrder: sortDirection as "ascend" | "descend",
      pageSize: pagination.pageSize,
      currentPage: pagination.current,
      statuses: filters.status as string[],
    });
  };

  return (
    <Table<GameHosted>
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
