import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Content, Sider } = Layout;

const adminNav = [
  {
    key: "/admin/quizzes",
    label: <Link to="/admin/quizzes">Quiz Management</Link>,
    icon: <AppstoreOutlined />,
  },
  {
    key: "/admin/questions",
    label: <Link to="/admin/questions">Question Management</Link>,
    icon: <FileTextOutlined />,
  },
  {
    key: "/admin/quiz-builder",
    label: <Link to="/admin/quiz-builder">Quiz Builder</Link>,
    icon: <PlusCircleOutlined />,
  },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="text-white text-lg text-center my-6 font-bold">Admin Panel</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={adminNav}
        />
      </Sider>
      <Layout>
        <Header className="bg-white px-6 shadow">
          <h1 className="text-xl font-semibold">Quiz Admin Dashboard</h1>
        </Header>
        <Content className="p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
