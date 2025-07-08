import axios from "@/api/axios";
import { useAuth } from "@/hooks/useAuth";
import { FacebookOutlined, GoogleOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message } from "antd";
import { Typography } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const { Title } = Typography;
type RegisterField = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
};

export default function LoginPage() {
  const { setAuth, updateCurrentUser } = useAuth();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values: RegisterField) => {
    try {
      setLoading(true);
      const response = await axios.post("/auth/login", {
        ...values,
      });

      if (response.status === 200) {
        const { accessToken, ...data } = response.data;

        setAuth({
          accessToken: accessToken,
        });

        updateCurrentUser(data);
        navigate("/admin/user-management");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 py-6">
      <div className="max-w-md mx-auto">
        <Card>
          <Title level={4} className="text-center mb-4 text-sky-500!">
            Login to your account
          </Title>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Button htmlType="button">
              <GoogleOutlined />
            </Button>

            <Button htmlType="button" className="bg-blue-600 text-white">
              <FacebookOutlined />
            </Button>
          </div>
          <div className="my-4 flex items-center justify-center gap-4">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-gray-500">or</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          <Form onFinish={onFinish} name="register" layout="vertical">
            <Form.Item<RegisterField>
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item<RegisterField>
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Button
              loading={loading}
              style={{ width: "100%" }}
              type="primary"
              htmlType="submit"
            >
              Login
            </Button>
          </Form>
          <div className="mt-4">
            <p className="text-center mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-500">
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
