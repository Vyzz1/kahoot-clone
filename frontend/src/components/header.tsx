import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import useLogout from "@/hooks/useLogout";
import { Button, Dropdown, Menu } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  MenuOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useState } from "react";

function Header() {
  const { currentUser, auth } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isLoggedIn = !!currentUser && !!auth;

  const userMenu = (
    <Menu>
      <Menu.Item key="settings">
        <Link to="/settings">Settings</Link>
      </Menu.Item>
      {currentUser?.role === "admin" && (
        <>
          <Menu.Divider />
          <Menu.Item key="admin">
            <Link to="/admin/user-management">User Management</Link>
          </Menu.Item>
          <Menu.Item key="migration">
            <Link to="/admin/migrate">Migration</Link>
          </Menu.Item>
        </>
      )}
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Kahoot Clone
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/join-game"
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Join Game
                </Link>
                <Link
                  to="/settings/quiz-management"
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  My Quizzes
                </Link>
              </>
            )}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* User Info with Dropdown */}
                <Dropdown
                  overlay={userMenu}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar || "/default-avatar.png"}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <UserOutlined className="text-purple-600" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {currentUser.name}
                      </span>
                      {currentUser.role === "admin" && (
                        <span className="text-xs text-red-600 font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                    <DownOutlined className="text-gray-400 text-xs" />
                  </div>
                </Dropdown>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button
                    type="default"
                    icon={<LoginOutlined />}
                    className="flex items-center"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    className="flex items-center"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Navigation */}
              <div className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                {isLoggedIn && (
                  <>
                    <Link
                      to="/join-game"
                      className="text-gray-700 hover:text-purple-600 transition-colors font-medium px-3 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Join Game
                    </Link>
                    <Link
                      to="/settings/quiz-management"
                      className="text-gray-700 hover:text-purple-600 transition-colors font-medium px-3 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Quizzes
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile User Actions */}
              <div className="border-t border-gray-200 pt-4">
                {isLoggedIn ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-3 py-2">
                      {currentUser.photoUrl ? (
                        <img
                          src={currentUser.photoUrl}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <UserOutlined className="text-purple-600" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          {currentUser.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {currentUser.email}
                        </span>
                        {currentUser.role === "admin" && (
                          <span className="text-xs text-red-600 font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Settings Link */}
                    <Link
                      to="/settings/quiz-management"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        type="default"
                        className="w-full mb-2"
                        icon={<UserOutlined />}
                      >
                        Settings
                      </Button>
                    </Link>

                    {/* Admin Panel Links */}
                    {currentUser.role === "admin" && (
                      <>
                        <Link
                          to="/admin/user-management"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            type="default"
                            className="w-full mb-2"
                            icon={<UserOutlined />}
                          >
                            User Management
                          </Button>
                        </Link>
                        <Link
                          to="/admin/migrate"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            type="default"
                            className="w-full mb-2"
                            icon={<UserOutlined />}
                          >
                            Migration
                          </Button>
                        </Link>
                      </>
                    )}

                    {/* Logout Button */}
                    <Button
                      type="default"
                      icon={<LogoutOutlined />}
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                      danger
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        type="default"
                        icon={<LoginOutlined />}
                        className="w-full"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        className="w-full"
                      >
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
