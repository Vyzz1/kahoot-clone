import { useForm } from "antd/es/form/Form";
import { Modal, Form, Input, Switch, Button, message } from "antd";
import { useState } from "react";
import useSubmitData from "@/hooks/useSubmitData";
import { useQueryClient } from "@tanstack/react-query";
import type { Quiz } from "@/types/global";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const onSuccess = (data: unknown) => {
    queryClient.invalidateQueries({ queryKey: ["/quizzes"] });
    setOpen(false);
    form.resetFields();

    if (onSubmit) {
      onSubmit(data as QuizFormFields);
    }

    setTimeout(() => {
      message.success(isEdit ? "Quiz updated successfully!" : "Quiz created successfully!"); // Changed to English

      // ✅ Redirect after new creation
      if (!isEdit && (data as Quiz)?._id) {
        navigate(`/admin/question-management?quizId=${(data as Quiz)._id}`);
      }
    }, 300);
  };

  const onError = (error: any) => {
    const errorMessage = error.response?.data?.message || "An error occurred!"; // Changed to English
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
        title: "Confirm Update", // Changed to English
        content: "Are you sure you want to update this quiz?", // Changed to English
        okText: "Update", // Changed to English
        cancelText: "Cancel", // Changed to English
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
        onClick={() => setOpen(true)}
        className="rounded-md shadow-sm hover:shadow-md transition-all"
      >
        {isEdit ? "Edit" : "Create Quiz"} {/* Changed to English */}
      </Button>

      <Modal
        open={open}
        title={isEdit ? "Edit Quiz" : "Create New Quiz"} 
        footer={null}
        centered
        onCancel={() => setOpen(false)}
        destroyOnHidden
        className="rounded-lg overflow-hidden"
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
          className="p-4"
        >
          <Form.Item
            label="Quiz Title" // Changed to English
            name="title"
            rules={[{ required: true, message: "Quiz title is required" }]} // Changed to English
          >
            <Input placeholder="Enter quiz title..." className="rounded-md" /> {/* Changed to English */}
          </Form.Item>

          <Form.Item label="Description" name="description"> {/* Changed to English */}
            <Input.TextArea placeholder="Add an optional description..." rows={3} className="rounded-md" /> {/* Changed to English */}
          </Form.Item>

          <Form.Item label="Public" name="isPublic" valuePropName="checked"> {/* Changed to English */}
            <Switch checkedChildren="Public" unCheckedChildren="Private" /> {/* Changed to English */}
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="w-full rounded-md shadow-sm hover:shadow-md transition-all mt-4"
          >
            {isEdit ? "Update Quiz" : "Create Quiz"} {/* Changed to English */}
          </Button>
        </Form>
      </Modal>
    </>
  );
}
