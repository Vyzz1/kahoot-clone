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
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");

  useEffect(() => {
    if (editingQuestion) {
      const answerTexts = editingQuestion.answers?.map((a) => a.text) || [];
      const correctIndexes =
        editingQuestion.answers
          ?.map((a, i) => (a.isCorrect ? i : -1))
          .filter((i) => i !== -1) || [];

      form.setFieldsValue({
        type: editingQuestion.type,
        title: editingQuestion.title,
        timeLimit: editingQuestion.timeLimit,
        answers: answerTexts.join("\n"),
        correctIndexes,
        answerText: editingQuestion.answerText,
        correctOrder: editingQuestion.correctOrder?.join("\n"),
      });

      setQuestionType(editingQuestion.type);
    } else {
      form.setFieldsValue({ type: "multiple_choice", timeLimit: 30 });
      setQuestionType("multiple_choice");
    }
  }, [editingQuestion, form]);

  const now = new Date().toISOString();

  const onFinish = (values: any) => {
    const base= {
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
      const answerLines = values.answers
        .split("\n")
        .filter((line: string) => line.trim() !== "");

      question.answers = answerLines.map((text: string, index: number) => ({
        text,
        isCorrect: values.correctIndexes?.includes(index) ?? false,
      }));
    }

    if (questionType === "short_answer") {
      question.answerText = values.answerText;
    }

    if (questionType === "ordering") {
      question.correctOrder = values.correctOrder
        .split("\n")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    if (questionType === "poll") {
      question.answers = values.answers
        .split("\n")
        .filter((line: string) => line.trim() !== "")
        .map((text: string) => ({ text }));
    }

    onAdd(question);
    form.resetFields();
    setQuestionType("multiple_choice");
    form.setFieldsValue({ type: "multiple_choice", timeLimit: 30 });
  };

  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <Form.Item label="Question Type" name="type" rules={[{ required: true }]}>
        <Select
          onChange={(v) => {
            setQuestionType(v as QuestionType);
            form.setFieldsValue({ type: v });
          }}
        >
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
            <Form.Item shouldUpdate={(prev, curr) => prev.answers !== curr.answers} noStyle>
              {({ getFieldValue }) => {
                const answersText = getFieldValue("answers") || "";
                const answers = answersText
                  .split("\n")
                  .filter((line: string) => line.trim() !== "");

                return answers.length > 0 ? (
                  <Form.Item
                    label="Correct Answer(s)"
                    name="correctIndexes"
                    rules={[{ required: true, message: "Please select correct answer(s)" }]}
                  >
                    <Select mode="multiple" placeholder="Select correct answer(s)">
                      {answers.map((text: string, index: number) => (
                        <Select.Option key={index} value={index}>
                          {text}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : null;
              }}
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
