import { Button, Form, Input, Card, Avatar, Row, Col, Typography } from "antd";
import { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";

const { Title, Text } = Typography;

interface JoinFormData {
  id: string;
  displayName: string;
  avatar: string;
}

interface InforJoinFormProps {
  onSubmit: (data: JoinFormData) => void;
  loading?: boolean;
}

export default function InforJoinForm({
  onSubmit,
  loading = false,
}: InforJoinFormProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [form] = Form.useForm();

  const { currentUser } = useAuth();

  const avatarOptions = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Fluffy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Snuggles",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Princess",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Tiger",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Cookie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Shadow",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Smokey",
  ];

  const handleFinish = (values: { displayName: string }) => {
    if (!selectedAvatar) {
      form.setFields([
        {
          name: "avatar",
          errors: ["Please select an avatar!"],
        },
      ]);
      return;
    }

    onSubmit({
      id: currentUser?._id as string,
      displayName: values.displayName,
      avatar: selectedAvatar,
    });
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    form.setFields([
      {
        name: "avatar",
        errors: [],
      },
    ]);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="shadow-lg">
        <div className="text-center mb-6">
          <Title level={3}>Join the Game!</Title>
          <Text type="secondary">
            Enter your display name and choose an avatar to get started
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Display Name"
            name="displayName"
            rules={[
              { required: true, message: "Please enter your display name!" },
              {
                min: 2,
                message: "Display name must be at least 2 characters!",
              },
              {
                max: 20,
                message: "Display name must be less than 20 characters!",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter your name"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Choose Your Avatar"
            name="avatar"
            help={
              selectedAvatar ? "Avatar selected!" : "Please select an avatar"
            }
          >
            <div className="mb-4">
              <Row gutter={[12, 12]}>
                {avatarOptions.map((avatarUrl, index) => (
                  <Col span={6} key={index}>
                    <div
                      className={`cursor-pointer transition-all duration-200 hover:scale-110 ${
                        selectedAvatar === avatarUrl
                          ? "ring-4 ring-blue-500 ring-opacity-50 rounded-full"
                          : ""
                      }`}
                      onClick={() => handleAvatarSelect(avatarUrl)}
                    >
                      <Avatar
                        size={60}
                        src={avatarUrl}
                        alt={`Avatar ${index + 1}`}
                        className="border-2 border-gray-200 hover:border-blue-400"
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Form.Item>

          {selectedAvatar && (
            <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg">
              <Text strong>Selected Avatar:</Text>
              <div className="mt-2">
                <Avatar size={80} src={selectedAvatar} />
              </div>
            </div>
          )}

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            block
            className="mt-4"
          >
            Join Game
          </Button>
        </Form>
      </Card>
    </div>
  );
}
