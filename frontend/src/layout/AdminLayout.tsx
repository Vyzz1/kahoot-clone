import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  DatabaseOutlined,
  UserOutlined,
  LockFilled,
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ro } from "date-fns/locale";

const { Content, Sider } = Layout;

const allAdminNavItems = [
  {
    key: "/admin/user-management",
    label: <Link to="/admin/user-management">User Management</Link>,
    icon: <UserOutlined />,
    roles: ["admin"],
  },
  {
    key: "/settings/quiz-management",
    label: <Link to="/settings/quiz-management">Quiz Management</Link>,
    icon: <AppstoreOutlined />,
    roles: ["admin", "user"],
  },
  {
    key: "/settings/question-management",
    label: <Link to="/settings/question-management">Question Management</Link>,
    icon: <FileTextOutlined />,
    roles: ["admin", "user"],
  },
  {
    key: "/settings/quiz-builder",
    label: <Link to="/settings/quiz-builder">Quiz Builder</Link>,
    icon: <PlusCircleOutlined />,
    roles: ["admin", "user"],
  },
  {
    key: "/game-hosted",
    label: <Link to="/settings/game-hosted">Game Hosted</Link>,
    icon: <UserOutlined />,
    roles: ["admin", "user"],
  },
  {
    key: "/game-played",
    label: <Link to="/settings/game-played">Game Played</Link>,
    icon: <UserOutlined />,
    roles: ["admin", "user"],
  },

  {
    key: "/admin/migrate",
    label: <Link to="/admin/migrate">API Migration</Link>,
    icon: <DatabaseOutlined />,
    roles: ["admin"],
  },
  {
    key: "/settings/change-password",
    label: <Link to="/settings/change-password">Change Password</Link>,
    icon: <LockFilled />,
    roles: ["admin", "user"],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const filteredAdminNav = allAdminNavItems.filter((item) =>
    item.roles.includes(currentUser?.role || "")
  );

  const isAdminRoute = location.pathname.startsWith("/admin");
  const panelTitle = isAdminRoute ? "Admin Panel" : "Settings";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <div className="text-gray-800 text-lg text-center my-6 font-bold border-b border-gray-200 pb-4">
          {panelTitle}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={filteredAdminNav}
          style={{ borderRight: "none" }}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
