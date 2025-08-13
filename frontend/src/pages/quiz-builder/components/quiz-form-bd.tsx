import { Input, Switch, Form } from "antd";
import { useEffect } from "react";

interface Props {
  quiz: Quiz;
  setQuiz: (quiz: Quiz) => void;
}

export default function QuizForm({ quiz, setQuiz }: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    const {  ...rest } = quiz;
    form.setFieldsValue(rest);
  }, [quiz, form]);

  const handleChange = (_: any, allValues: Quiz) => {

    setQuiz(allValues);
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


      <Form.Item label="Public" name="isPublic" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Form>
  );
}