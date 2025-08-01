import { useForm } from "antd/es/form/Form";
import { Modal, Form, Input, Switch, Button, message } from "antd";
import { useState, useEffect } from "react";
import useSubmitData from "@/hooks/useSubmitData";
import { useQueryClient } from "@tanstack/react-query";
import type { Quiz } from "@/types/global";
import { useNavigate } from "react-router-dom";

interface QuizFormProps {
  isEdit: boolean;
  initialValues?: Quiz;
  onSubmit?: (values: QuizFormFields) => void;
  isDisabled?: boolean;
  currentQueryKey: string; // ✅ Thêm prop này
}

type QuizFormFields = {
  title: string;
  description?: string;
  isPublic: boolean;
};

export default function QuizForm({
  isEdit,
  initialValues,
  onSubmit,
  isDisabled = false,
  currentQueryKey,
}: QuizFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [form] = useForm<QuizFormFields>();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title || "",
        description: initialValues.description || "",
        isPublic: initialValues.isPublic ?? true,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        title: "",
        description: "",
        isPublic: true,
      });
    }
  }, [initialValues, form]);

  const onSuccess = (data: unknown) => {
    const newQuiz = data as Quiz;

    // ✅ Invalidate the quizzes query using the currentQueryKey
    queryClient.invalidateQueries({ queryKey: [currentQueryKey] });

    setOpen(false);
    form.resetFields();
    if (onSubmit) onSubmit(newQuiz);
    setTimeout(() => {
      message.success(
        isEdit ? "Quiz updated successfully!" : "Quiz created successfully!"
      );
      if (!isEdit && newQuiz._id) {
        navigate(`/settings/question-management?quizId=${newQuiz._id}`);
      }
    }, 300);
  };

  const onError = (error: any) => {
    message.error(error.response?.data?.message || "An error occurred!");
  };

  const { mutate, isPending } = useSubmitData("", onSuccess, onError);

  const handleFinish = (values: QuizFormFields) => {
    const submit = () => {
      const endpoint = isEdit ? `/quizzes/${initialValues?._id}` : "/quizzes";
      mutate({
        data: values,
        type: isEdit ? "put" : "post",
        endpoint,
      });
    };

    if (isEdit) {
      Modal.confirm({
        title: "Confirm Update",
        content: "Are you sure you want to update this quiz?",
        onOk: submit,
        centered: true,
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
        onClick={() => setOpen(true)}
        disabled={isDisabled}
        className="rounded-md shadow-sm hover:shadow-md"
      >
        {isEdit ? "Edit" : "Create Quiz"}
      </Button>

      <Modal
        open={open}
        title={isEdit ? "Edit Quiz" : "Create New Quiz"}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
      >
        <Form<QuizFormFields>
          layout="vertical"
          form={form}
          initialValues={{
            title: initialValues?.title || "",
            description: initialValues?.description || "",
            isPublic: initialValues?.isPublic ?? true,
          }}
          disabled={isPending}
          onFinish={handleFinish}
          className="p-4"
        >
          <Form.Item
            label="Quiz Title"
            name="title"
            rules={[{ required: true, message: "Quiz title is required" }]}
          >
            <Input placeholder="Enter quiz title..." />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              placeholder="Add an optional description..."
              rows={3}
            />
          </Form.Item>

          <Form.Item label="Public" name="isPublic" valuePropName="checked">
            <Switch checkedChildren="Public" unCheckedChildren="Private" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="w-full mt-4"
          >
            {isEdit ? "Update Quiz" : "Create Quiz"}
          </Button>
        </Form>
      </Modal>
    </>
  );
}
