import useSubmitData from "@/hooks/useSubmitData";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import { useState } from "react";
import type { User } from "@/types/global";

type UserFormFields = Omit<
  User,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "lastLogin"
  | "isActive"
  | "provider"
  | "providerId"
>;
interface UserFormProps {
  isEdit: boolean;
  initialValues?: User;
  onSubmit?: (values: UserFormFields) => void;
}

function UserForm({ isEdit, initialValues, onSubmit }: UserFormProps) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const onSuccess = (data: unknown) => {
    queryClient.invalidateQueries({
      queryKey: ["/users/list"],
    });

    setOpen(false);

    if (onSubmit) {
      onSubmit(data as UserFormFields);
    }

    setTimeout(() => {
      message.success(
        isEdit ? "User updated successfully" : "User created successfully"
      );
    }, 500);
    form.resetFields();
  };

  const onError = (error: any) => {
    const errorMessage = error.response?.data?.message || "An error occurred";
    message.error(errorMessage);
  };

  const { mutate, isPending } = useSubmitData(
    `/users/${isEdit ? initialValues?._id : ""}`,
    onSuccess,
    onError
  );

  const handleFinish = (values: UserFormFields) => {
    mutate({ data: values, type: isEdit ? "put" : "post" });
  };

  const [form] = useForm();

  return (
    <>
      <Button
        type="primary"
        size="small"
        className="bg-blue-600 text-white"
        onClick={() => {
          setOpen(true);
        }}
      >
        {isEdit ? "Update" : "Create User"}
      </Button>

      <Modal
        open={open}
        centered
        footer={null}
        onCancel={() => setOpen(false)}
        title={isEdit ? "Update User" : "Create User"}
      >
        <Form<UserFormFields>
          initialValues={initialValues}
          onFinish={handleFinish}
          layout="vertical"
          form={form}
        >
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[
              { required: true, message: "Please enter the user's name" },
            ]}
          >
            <Input placeholder="Enter user's name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter the user's email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input readOnly={isEdit} placeholder="Enter user's email" />
          </Form.Item>
          <Form.Item
            label="Avatar URL"
            name="avatar"
            rules={[
              {
                required: false,
                message: "Please enter the user's avatar URL",
              },
              {
                type: "url",
                message: "Please enter a valid URL for the avatar",
              },
            ]}
          >
            <Input placeholder="Enter user's avatar" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: !isEdit, message: "Please enter a password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              placeholder={
                isEdit
                  ? "Leave blank to keep current password"
                  : "Enter password"
              }
            />
          </Form.Item>

          <Button
            type="primary"
            size="small"
            htmlType="submit"
            loading={isPending}
            style={{ width: "100%" }}
          >
            {isEdit ? "Update User" : "Create User"}
          </Button>
        </Form>
      </Modal>
    </>
  );
}

export default UserForm;
