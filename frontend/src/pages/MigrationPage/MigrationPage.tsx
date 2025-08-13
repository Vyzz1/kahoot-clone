import { Button, Card, Flex, message, Typography, Spin, Table, Tag } from "antd";
import { BackwardFilled, DatabaseOutlined, ReloadOutlined, SyncOutlined } from "@ant-design/icons"; 
import useSubmitData from "@/hooks/useSubmitData";
import useFetchData from "@/hooks/useFetchData"; 
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

interface MigrationStatusResponse {
  currentVersion: number;
  migrations: {
    version: number;
    name: string;
    status: 'Applied' | 'Pending';
  }[];
}

export default function MigrationPage() {
  const navigate = useNavigate();
  const { data: migrationStatus, isLoading: isLoadingStatus, refetch: refetchMigrationStatus } = useFetchData<MigrationStatusResponse>(
    "/migrate/status",
    {
      type: "private", 
      uniqueKey: ["migration-status"], 
    }
  );

  const { mutate: seedMutate, isPending: isSeeding } = useSubmitData(
    "/migrate/seed-data",
    () => {
      message.success("Sample data seeded successfully!");
      refetchMigrationStatus(); 
    },
    (error: any) => {
      message.error(error.response?.data?.message || "Failed to seed data.");
    }
  );

  const { mutate: migrateMutate, isPending: isMigrating } = useSubmitData(
    "/migrate/run-migrations",
    (response: any) => { 
      const { message: msg, migrationsRun, newVersion } = response;
      message.success(`${msg} New DB version: ${newVersion}`);
      if (migrationsRun && migrationsRun.length > 0) {
        message.info(`Migrations applied: ${migrationsRun.map((m: any) => m.name).join(", ")}`);
      }
      refetchMigrationStatus(); 
    },
    (error: any) => {
      message.error(error.response?.data?.message || "Failed to run migrations.");
    }
  );

  const handleSeedData = () => {
    seedMutate({ type: "post" });
  };

  const handleRunMigrations = () => {
    migrateMutate({ type: "post" });
  };

  const migrationTableColumns = [
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      sorter: (a: any, b: any) => a.version - b.version,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: 'Applied' | 'Pending') => (
        <Tag color={status === 'Applied' ? 'green' : 'blue'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <section className="px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Title level={3} className="text-center text-gray-800">
          <DatabaseOutlined className="mr-2" />API Migration & Seeding
        </Title>

        <Card className="shadow-lg rounded-xl p-6">
          <Flex justify="space-between" align="center" className="mb-4">
            <Title level={4} className="mb-0 text-blue-600">
              <SyncOutlined className="mr-2" />Migration Status
            </Title>
            <div className="flex items-center space-x-2">
              <Button
                icon={<BackwardFilled />}
                onClick={() => navigate("/admin/user-management")}
                className="rounded-md shadow-sm"
              >
                User Management
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetchMigrationStatus()}
                loading={isLoadingStatus}
                className="rounded-md shadow-sm"
              >
                Refresh Status
              </Button>
            </div>
          </Flex>
          {isLoadingStatus ? (
            <div className="text-center py-4">
              <Spin size="large" tip="Loading migration status..." />
            </div>
          ) : (
            <>
              <Paragraph className="text-gray-700 mb-4">
                Current Database Version: <span className="font-bold text-blue-700">{migrationStatus?.currentVersion ?? 'N/A'}</span>
              </Paragraph>
              <Table
                columns={migrationTableColumns}
                dataSource={migrationStatus?.migrations || []}
                rowKey="version"
                pagination={false} 
                size="small"
                className="rounded-md overflow-hidden"
              />
            </>
          )}
        </Card>

        <Card className="shadow-lg rounded-xl p-6">
          <Title level={4} className="mb-4 text-blue-600">
            <ReloadOutlined className="mr-2" />Seed Sample Data
          </Title>
          <Paragraph className="text-gray-700 mb-6">
            Chức năng này sẽ tạo ra các người dùng, quiz và câu hỏi mẫu trong cơ sở dữ liệu của bạn.
            Điều này rất hữu ích cho việc phát triển và thử nghiệm.
            <br />
            <span className="font-bold text-red-500">
              Lưu ý: Chức năng này sẽ xóa tất cả dữ liệu người dùng, quiz và câu hỏi hiện có trước khi tạo dữ liệu mới.
            </span>
          </Paragraph>
          <Flex justify="center">
            <Button
              type="primary"
              size="large"
              onClick={handleSeedData}
              loading={isSeeding}
              className="bg-green-500 hover:bg-green-600 text-white rounded-md shadow-md transition-all"
            >
              {isSeeding ? "Seeding..." : "Seed Sample Data"}
            </Button>
          </Flex>
        </Card>

        <Card className="shadow-lg rounded-xl p-6">
          <Title level={4} className="mb-4 text-blue-600">
            <DatabaseOutlined className="mr-2" />Run Schema Migrations
          </Title>
          <Paragraph className="text-gray-700 mb-6">
            Chức năng này sẽ áp dụng các thay đổi cấu trúc cơ sở dữ liệu (schema migrations) cần thiết cho các phiên bản ứng dụng mới.
            Ví dụ: thêm các trường mới vào các model hiện có.
            <br />
            <span className="font-bold text-orange-500">
              Hãy cẩn thận khi chạy chức năng này trên môi trường production.
            </span>
          </Paragraph>
          <Flex justify="center">
            <Button
              type="default"
              size="large"
              onClick={handleRunMigrations}
              loading={isMigrating}
              className="border-blue-500 text-blue-500 hover:text-blue-600 hover:border-blue-600 rounded-md shadow-md transition-all"
            >
              {isMigrating ? "Migrating..." : "Run Schema Migrations"}
            </Button>
          </Flex>
        </Card>
      </div>
    </section>
  );
}
