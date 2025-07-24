// // src/layout/AdminLayout.tsx
// import { Layout, Menu } from "antd";
// import {
//   AppstoreOutlined,
//   FileTextOutlined,
//   PlusCircleOutlined,
//   DatabaseOutlined, // ✅ Import DatabaseOutlined
//   UserOutlined, // Import UserOutlined for User Management
// } from "@ant-design/icons";
// import { Link, Outlet, useLocation } from "react-router-dom";

// const { Header, Content, Sider } = Layout;

// const adminNav = [
//   {
//     key: "/admin/user-management", // ✅ Thêm key cho User Management
//     label: <Link to="/admin/user-management">User Management</Link>, // ✅ Thêm User Management
//     icon: <UserOutlined />, // ✅ Icon cho User Management
//   },
//   {
//     key: "/admin/quiz-management",
//     label: <Link to="/admin/quiz-management">Quiz Management</Link>,
//     icon: <AppstoreOutlined />,
//   },
//   {
//     key: "/admin/question-management",
//     label: <Link to="/admin/question-management">Question Management</Link>,
//     icon: <FileTextOutlined />,
//   },
//   {
//     key: "/admin/quiz-builder",
//     label: <Link to="/admin/quiz-builder">Quiz Builder</Link>,
//     icon: <PlusCircleOutlined />,
//   },
//   {
//     key: "/admin/migrate", // ✅ Thêm key cho API Migration
//     label: <Link to="/admin/migrate">API Migration</Link>, // ✅ Thêm API Migration
//     icon: <DatabaseOutlined />, // ✅ Sử dụng icon DatabaseOutlined
//   },
// ];

// export default function AdminLayout() {
//   const location = useLocation();

//   return (
//     <Layout style={{ minHeight: "100vh" }}>
//       <Sider breakpoint="lg" collapsedWidth="0">
//         <div className="text-white text-lg text-center my-6 font-bold">Admin Panel</div>
//         <Menu
//           theme="dark"
//           mode="inline"
//           selectedKeys={[location.pathname]}
//           items={adminNav}
//         />
//       </Sider>
//       <Layout>
//         <Header style={{ padding: 0, background: "#fff" }} className="px-5">
//           <div className="text-xl font-semibold text-gray-700">Quiz Admin Dashboard</div>
//         </Header>
//         <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
//           {/* Outlet sẽ render các tuyến đường con tại đây */}
//           <Outlet />
//         </Content>
//         {/* Có thể thêm Footer tại đây nếu cần */}
//       </Layout>
//     </Layout>
//   );
// }

// src/layout/AdminLayout.tsx
import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  DatabaseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; 

const { Header, Content, Sider } = Layout;

// Định nghĩa tất cả các mục điều hướng
const allAdminNavItems = [
  {
    key: "/admin/user-management",
    label: <Link to="/admin/user-management">User Management</Link>,
    icon: <UserOutlined />,
    roles: ["admin"], // ✅ Chỉ admin mới thấy mục này
  },
  {
    key: "/admin/quiz-management",
    label: <Link to="/admin/quiz-management">Quiz Management</Link>,
    icon: <AppstoreOutlined />,
    roles: ["admin", "user"], // ✅ Admin và User đều thấy
  },
  {
    key: "/admin/question-management",
    label: <Link to="/admin/question-management">Question Management</Link>,
    icon: <FileTextOutlined />,
    roles: ["admin", "user"], // ✅ Admin và User đều thấy
  },
  {
    key: "/admin/quiz-builder",
    label: <Link to="/admin/quiz-builder">Quiz Builder</Link>,
    icon: <PlusCircleOutlined />,
    roles: ["admin", "user"], // ✅ Admin và User đều thấy
  },
  {
    key: "/admin/migrate",
    label: <Link to="/admin/migrate">API Migration</Link>,
    icon: <DatabaseOutlined />,
    roles: ["admin"], // ✅ Chỉ admin mới thấy mục này
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const { currentUser } = useAuth(); // Lấy thông tin người dùng hiện tại từ AuthContext

  // Lọc các mục điều hướng dựa trên vai trò của người dùng
  const filteredAdminNav = allAdminNavItems.filter(item =>
    item.roles.includes(currentUser?.role || "") // Nếu currentUser hoặc role không tồn tại, sẽ không khớp
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="text-white text-lg text-center my-6 font-bold">Admin Panel</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={filteredAdminNav} 
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: "#fff" }} className="px-5">
          <div className="text-xl font-semibold text-gray-700">Quiz Admin Dashboard</div>
        </Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
