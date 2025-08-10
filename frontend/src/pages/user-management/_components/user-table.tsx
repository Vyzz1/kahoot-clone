import DeleteConfirm from "@/components/delete-confirm";
import { Badge, Table, Tooltip, type TableProps } from "antd";
import { format } from "date-fns";
import UserForm from "./user-form";
import BanUser from "./ban-user";
import { cn, getDefaultSorter } from "@/lib/utils";
import { useUserFilter } from "../_hooks/useUserFilter";

interface UserTableProps {
  users: Pagination<User>;
  isLoading?: boolean;
}

export default function UserTable({ users, isLoading }: UserTableProps) {
  const {
    providers,
    statuses,
    sortBy,
    sortOrder,

    setFilters,
  } = useUserFilter();

  const columns: TableProps<User>["columns"] = [
    {
      key: "user",
      title: "User",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={
              record.avatar ||
              "https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
            alt="Avatar"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex flex-col">
            <span
              className={cn("font-medium text-gray-900 ", {
                " text-red-800  line-through ": record.isBanned,
              })}
            >
              {record.fullName}
            </span>
            <span
              className={cn("text-sm text-gray-500", {
                " text-red-500  line-through ": record.isBanned,
              })}
            >
              {record.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "provider",
      title: "Provider",
      dataIndex: "provider",
      render: (_, { provider, providerId }) => (
        <Tooltip title={`Provider ID: ${providerId}`}>
          <span className="capitalize">{provider}</span>
        </Tooltip>
      ),
      filters: [
        { text: "Google", value: "google" },
        { text: "Facebook", value: "facebook" },
        { text: "Email", value: "email" },
      ],
      filteredValue: providers,
    },
    {
      key: "createdAt",
      title: "Created At",
      dataIndex: "createdAt",
      sorter: true,

      render: (createdAt) => format(new Date(createdAt), "PPP"),

      ...{
        ...getDefaultSorter({
          refField: sortBy,
          fieldName: "createdAt",
          sortOrder: sortOrder,
        }),
      },
    },
    {
      key: "lastLogin",
      title: "Last Login",
      dataIndex: "lastLogin",
      sorter: true,
      render: (lastLogin) => {
        if (!lastLogin) return "Never";
        return format(new Date(lastLogin), "PPPpp");
      },
      ...{
        ...getDefaultSorter({
          refField: sortBy,
          fieldName: "lastLogin",
          sortOrder: sortOrder,
        }),
      },
    },
    {
      key: "isBanned",
      title: "Status",
      dataIndex: "isBanned",
      render: (isBanned) => (
        <Badge
          status={isBanned ? "success" : "error"}
          text={!isBanned ? "Active" : "Banned"}
        />
      ),
      filters: [
        {
          text: "Active",
          value: false,
        },
        {
          text: "Banned",
          value: true,
        },
      ],
      filteredValue: statuses,
    },

    {
      key: "actions",
      title: "Actions",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <UserForm isEdit initialValues={record} />
          <DeleteConfirm
            term={` ${record.fullName}`}
            queryKey={["/users/list"]}
            endpoint={`/users/${record._id}`}
            onDelete={() => {}}
          />
          <BanUser isBanned={record.isBanned} id={record._id.toString()} />
        </div>
      ),
    },
  ];

  const onChange: TableProps<User>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    const sortInfo = Array.isArray(sorter) ? sorter[0] : sorter;
    const sortDirection = sortInfo.order;

    setFilters({
      sortBy: sortInfo.field as keyof User,
      sortOrder: sortDirection as "ascend" | "descend",
      pageSize: pagination.pageSize,
      currentPage: pagination.current,
      statuses: filters.isBanned as string[],
      providers: filters.provider as string[],
    });
  };

  return (
    <Table<User>
      rowKey={(record) => record._id.toString()}
      columns={columns}
      onChange={onChange}
      loading={isLoading}
      dataSource={users?.content || []}
      pagination={{
        total: users?.totalCount,
        current: users?.currentPage,
        pageSize: users?.pageSize,
      }}
    />
  );
}
