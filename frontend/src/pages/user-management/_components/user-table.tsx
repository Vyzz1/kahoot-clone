import DeleteConfirm from "@/components/delete-confirm";
import { Badge, Table, Tooltip, type TableProps } from "antd";
import { format } from "date-fns";

interface UserTableProps {
  users: Pagination<User>;
}

export default function UserTable({ users }: UserTableProps) {
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
            <span className="font-medium text-gray-900">{record.fullName}</span>
            <span className="text-sm text-gray-500">{record.email}</span>
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
    },
    {
      key: "createdAt",
      title: "Created At",
      dataIndex: "createdAt",
      render: (createdAt) => format(new Date(createdAt), "PPP"),
    },
    {
      key: "lastLogin",
      title: "Last Login",
      dataIndex: "lastLogin",
      render: (lastLogin) => {
        if (!lastLogin) return "Never";
        return format(new Date(lastLogin), "PPPpp");
      },
    },
    {
      key: "isActive",
      title: "Status",
      dataIndex: "isActive",
      render: (isActive) => (
        <Badge
          status={isActive ? "success" : "error"}
          text={isActive ? "Active" : "Inactive"}
        />
      ),
    },

    {
      key: "actions",
      title: "Actions",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Edit User">
            <span className="cursor-pointer text-blue-500 hover:text-blue-700">
              Edit
            </span>
          </Tooltip>
          <DeleteConfirm
            term={` ${record.fullName}`}
            queryKey={["/users/list"]}
            endpoint={`/users/${record._id}`}
            onDelete={() => {}}
          ></DeleteConfirm>
        </div>
      ),
    },
  ];

  return (
    <Table<User>
      rowKey={(record) => record._id.toString()}
      columns={columns}
      dataSource={users.content}
      pagination={{
        total: users.totalCount,
      }}
    />
  );
}
