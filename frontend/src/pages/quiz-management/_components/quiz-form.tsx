import { useForm } from "antd/es/form/Form";
import { Modal, Form, Input, Switch, Button, message } from "antd";
import { useState } from "react";
import useSubmitData from "@/hooks/useSubmitData";
import { useQueryClient } from "@tanstack/react-query";

interface QuizFormProps {
  isEdit: boolean;
  initialValues?: Quiz;
  onSubmit?: (values: QuizFormFields) => void;
}

type QuizFormFields = {
  title: string;
  description?: string;
  isPublic: boolean;
};

export default function QuizForm({ isEdit, initialValues, onSubmit }: QuizFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [form] = useForm<QuizFormFields>();

  const onSuccess = (data: unknown) => {
    queryClient.invalidateQueries({
      queryKey: ["/quizzes"],
    });

    setOpen(false);
    form.resetFields();

    if (onSubmit) {
      onSubmit(data as QuizFormFields);
    }

    setTimeout(() => {
      message.success(isEdit ? "Quiz updated successfully" : "Quiz created successfully");
    }, 500);
  };

  const onError = (error: any) => {
    const errorMessage = error.response?.data?.message || "An error occurred";
    message.error(errorMessage);
  };

  const { mutate, isPending } = useSubmitData(
    `/quizzes/${isEdit ? initialValues?._id : ""}`,
    onSuccess,
    onError
  );

    const handleFinish = (values: QuizFormFields) => {
        const submit = () => {
            mutate({
            data: values,
            type: isEdit ? "put" : "post",
            });
        };

        if (isEdit) {
            Modal.confirm({
            title: "Confirm Update",
            content: "Are you sure you want to update this quiz?",
            okText: "Update",
            cancelText: "Cancel",
            centered: true,
            onOk: submit,
            });
        } else {
            submit();
        }
    };

  return (
    <>
      <Button
        type={isEdit ? "default" : "primary"}
        size="small"
        onClick={() => {
          setOpen(true);
        }}
      >
        {isEdit ? "Edit" : "Create Quiz"}
      </Button>

      <Modal
        open={open}
        title={isEdit ? "Edit Quiz" : "Create New Quiz"}
        footer={null}
        centered
        onCancel={() => setOpen(false)}
      >
        <Form<QuizFormFields>
          layout="vertical"
          form={form}
          disabled={isPending}
          initialValues={{
            title: initialValues?.title || "",
            description: initialValues?.description || "",
            isPublic: initialValues?.isPublic ?? true,
          }}
          onFinish={handleFinish}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Quiz title is required" }]}
          >
            <Input placeholder="Enter quiz title" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Enter description (optional)" rows={3} />
          </Form.Item>

          <Form.Item
            label="Public"
            name="isPublic"
            valuePropName="checked"
          >
            <Switch checkedChildren="Public" unCheckedChildren="Private" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            style={{ width: "100%" }}
          >
            {isEdit ? "Update Quiz" : "Create Quiz"}
          </Button>
        </Form>
      </Modal>
    </>
  );
}
