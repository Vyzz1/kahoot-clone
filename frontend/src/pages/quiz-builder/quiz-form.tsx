import { Input, Switch, Form } from "antd";
import type { Quiz } from "@/types/global";
import { useEffect } from "react";

interface Props {
  quiz: Quiz;
  setQuiz: (quiz: Quiz) => void;
}

export default function QuizForm({ quiz, setQuiz }: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(quiz);
  }, [quiz, form]);

  const handleChange = (_: any, allValues: Quiz) => {
    // Explicitly convert quizTimeLimit to a number
    const updatedValues = {
      ...allValues,
      quizTimeLimit: allValues.quizTimeLimit ? Number(allValues.quizTimeLimit) : 0,
    };
    setQuiz(updatedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={quiz}
      onValuesChange={handleChange}
    >
      <Form.Item
        label="Quiz Title"
        name="title"
        rules={[{ required: true, message: "Title is required" }]}
      >
        <Input placeholder="Enter quiz title..." />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <Input.TextArea placeholder="Add an optional description..." />
      </Form.Item>

      <Form.Item
        label="Quiz Time Limit (minutes)"
        name="quizTimeLimit"
        rules={[{ required: true, type: 'number', min: 1, message: "Time limit must be a positive number" }]}
      >
        <Input type="number" min={1} placeholder="Enter overall quiz time limit in minutes" />
      </Form.Item>

      <Form.Item label="Public" name="isPublic" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Form>
  );
}