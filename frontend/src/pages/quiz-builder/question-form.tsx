import { Form, Input, Select, Button } from "antd";
import { useState, useEffect } from "react";
import type { Question, QuestionType } from "../../types/types";
import { v4 as uuidv4 } from "uuid";


interface QuestionFormProps {
  quizId: string;
  onAdd: (q: Question & Partial<{ answerText: string; correctOrder: string[] }>) => void;
  editingQuestion?: (Question & Partial<{ answerText: string; correctOrder: string[] }>) | null;
}

export default function QuestionForm({
  quizId,
  onAdd,
  editingQuestion,
}: QuestionFormProps) {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState<QuestionType>(
    editingQuestion?.type || "multiple_choice"
  );

  useEffect(() => {
    if (editingQuestion) {
      form.setFieldsValue({
        type: editingQuestion.type,
        title: editingQuestion.title,
        timeLimit: editingQuestion.timeLimit,
        answers: editingQuestion.answers?.map((a) => a.text).join("\n"),
        correctIndex: editingQuestion.answers?.findIndex((a) => a.isCorrect),
        answerText: (editingQuestion as any).answerText,
        correctOrder: (editingQuestion as any).correctOrder?.join("\n"),
      });
      setQuestionType(editingQuestion.type);
    } else {
      form.resetFields();
      setQuestionType("multiple_choice");
    }
  }, [editingQuestion]);

  const now = new Date().toISOString();

  const onFinish = (values: any) => {
    const base = {
      _id: editingQuestion?._id || uuidv4(),
      quizId,
      type: questionType,
      title: values.title,
      timeLimit: values.timeLimit,
      createdAt: editingQuestion?.createdAt || now,
      updatedAt: now,
    };

    const question: Question & Partial<{ answerText: string; correctOrder: string[] }> = {
      ...base,
      answers: [],
    };

    if (questionType === "multiple_choice" || questionType === "true_false") {
      const answers = values.answers
        .split("\n")
        .filter((line: string) => line.trim() !== "")
        .map((text: string, index: number) => ({
          text,
          isCorrect: index === values.correctIndex,
        }));
      question.answers = answers;
    }

    if (questionType === "short_answer") {
      question.answerText = values.answerText;
      question.answers = []; // optional
    }

    if (questionType === "ordering") {
      question.correctOrder = values.correctOrder
        .split("\n")
        .map((t: string) => t.trim())
        .filter(Boolean);
      question.answers = []; // optional
    }

    if (questionType === "poll") {
      const pollAnswers = values.answers
        .split("\n")
        .filter((line: string) => line.trim() !== "")
        .map((text: string) => ({ text }));
      question.answers = pollAnswers;
    }

    onAdd(question);
    form.resetFields();
    setQuestionType("multiple_choice");
  };

  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <Form.Item label="Question Type" name="type" initialValue="multiple_choice">
        <Select onChange={(v) => setQuestionType(v as QuestionType)}>
          <Select.Option value="multiple_choice">Multiple Choice</Select.Option>
          <Select.Option value="true_false">True/False</Select.Option>
          <Select.Option value="short_answer">Short Answer</Select.Option>
          <Select.Option value="ordering">Ordering</Select.Option>
          <Select.Option value="poll">Poll</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Question Title" name="title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      {(questionType === "multiple_choice" ||
        questionType === "true_false" ||
        questionType === "poll") && (
        <>
          <Form.Item
            label="Answers (each line is one answer)"
            name="answers"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} placeholder="Answer 1\nAnswer 2\nAnswer 3" />
          </Form.Item>

          {questionType !== "poll" && (
            <Form.Item
              label="Correct Answer Index"
              name="correctIndex"
              rules={[
                { required: true, message: "Please enter the correct answer index" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const answers = getFieldValue("answers")?.split("\n") || [];
                    if (value < 0 || value >= answers.length) {
                      return Promise.reject(
                        new Error(`Index must be between 0 and ${answers.length - 1}`)
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input type="number" min={0} />
            </Form.Item>
          )}
        </>
      )}

      {questionType === "short_answer" && (
        <Form.Item
          label="Correct Answer Text"
          name="answerText"
          rules={[{ required: true }]}
        >
          <Input placeholder="Exact correct answer text" />
        </Form.Item>
      )}

      {questionType === "ordering" && (
        <Form.Item
          label="Correct Order (each line is one item)"
          name="correctOrder"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={4} placeholder="Step 1\nStep 2\nStep 3" />
        </Form.Item>
      )}

      <Form.Item
        label="Time Limit (seconds)"
        name="timeLimit"
        initialValue={30}
        rules={[{ required: true }]}
      >
        <Input type="number" min={5} />
      </Form.Item>

      <Button htmlType="submit" type="primary">
        {editingQuestion ? "Update Question" : "Add Question"}
      </Button>
    </Form>
  );
}
