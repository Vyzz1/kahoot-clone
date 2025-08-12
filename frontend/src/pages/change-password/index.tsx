import { Card, Form, Input, Button, message, Typography, Modal } from "antd";
import {
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import useSubmitData from "@/hooks/useSubmitData";
import useLogout from "@/hooks/useLogout";

const { Title } = Typography;

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  [key: string]: any;
}

export default function ChangePasswordPage() {
  const [form] = Form.useForm();
  const logout = useLogout();

  const showLogoutModal = () => {
    Modal.confirm({
      title: "Password Changed Successfully",
      icon: <ExclamationCircleOutlined />,
      content:
        "Your password has been updated successfully. For security reasons, you need to login again with your new password.",
      okText: "Login Again",

      onOk: async () => {
        try {
          await logout();
          message.success(
            "Logged out successfully. Please login with your new password."
          );
        } catch (error) {
          console.error("Logout error:", error);
          await logout();
        }
      },
      onCancel: async () => {
        await logout();
      },
    });
  };

  const onSuccess = () => {
    form.resetFields();
    showLogoutModal();
  };

  const onError = (error: any) => {
    const errorMessage =
      error.response?.data?.message ||
      "Failed to change password. Please try again.";
    message.error(errorMessage);
  };

  const { mutate, isPending } = useSubmitData(
    "/auth/change-password",
    onSuccess,
    onError
  );

  const handleFinish = (values: ChangePasswordFormData) => {
    mutate({
      data: values,
      type: "post",
    });
  };

  const validateConfirmPassword = (_: any, value: string) => {
    if (!value || form.getFieldValue("newPassword") === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Passwords do not match"));
  };

  const validateNewPassword = (_: any, value: string) => {
    const oldPassword = form.getFieldValue("oldPassword");
    if (value && oldPassword && value === oldPassword) {
      return Promise.reject(
        new Error("New password should be different from current password")
      );
    }
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <LockOutlined className="text-4xl text-blue-600 mb-4" />
          <Title level={2} className="text-gray-900">
            Change Password
          </Title>
          <p className="text-gray-600">
            Update your password to keep your account secure
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <Form
            form={form}
            name="change-password"
            onFinish={handleFinish}
            layout="vertical"
            size="large"
            disabled={isPending}
          >
            <Form.Item
              name="oldPassword"
              label="Current Password"
              rules={[
                {
                  required: true,
                  message: "Please enter your current password!",
                },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your current password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please enter your new password!" },
                { min: 6, message: "Password must be at least 6 characters" },
                { validator: validateNewPassword },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your new password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your new password!",
                },
                { min: 6, message: "Password must be at least 6 characters" },
                { validator: validateConfirmPassword },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Confirm your new password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                className="h-12"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-0 text-lg font-medium"
              >
                {isPending ? "Updating Password..." : "Update Password"}
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Password Requirements:
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Different from your current password</li>
              <li>• Use a strong, unique password</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
