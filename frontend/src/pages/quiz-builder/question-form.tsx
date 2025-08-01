import { Form, Input, Select, Button } from "antd";
import { useState, useEffect } from "react";
import type { Question, QuestionType, Media } from "../../types/global";
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

  // Custom validator for positive numbers
  const positiveNumberValidator = (_: any, value: any) => {
    const numValue = Number(value);
    if (value === undefined || value === null || value === '') {
      return Promise.reject(new Error('This field is required'));
    }
    if (isNaN(numValue) || numValue <= 0) {
      return Promise.reject(new Error('Must be a positive number'));
    }
    return Promise.resolve();
  };

  useEffect(() => {
    if (editingQuestion) {
      const answerTexts = editingQuestion.answers?.map((a) => a.text) || [];
      const correctIndexes =
        editingQuestion.answers
          ?.map((a, i) => (a.isCorrect ? i : -1))
          .filter((i) => i !== -1) || [];

      form.setFieldsValue({
        type: editingQuestion.type,
        content: editingQuestion.content,
        timeLimit: editingQuestion.timeLimit,
        answers: answerTexts.join("\n"),
        correctIndexes: editingQuestion.type === "true_false" ? correctIndexes[0] : correctIndexes,
        answerText: editingQuestion.answerText,
        correctOrder: editingQuestion.correctOrder?.join("\n"),
        points: editingQuestion.points,
        imageUrl: editingQuestion.media?.image,
        videoUrl: editingQuestion.media?.video,
      });

      setQuestionType(editingQuestion.type);
    } else {
      form.setFieldsValue({
        type: "multiple_choice",
        timeLimit: 30,
        content: "",
        answers: "",
        correctIndexes: [],
        answerText: "",
        correctOrder: "",
        points: 100,
        imageUrl: "",
        videoUrl: "",
      });
      setQuestionType("multiple_choice");
    }
  }, [editingQuestion, form]);

  const now = new Date().toISOString();

  const onFinish = (values: any) => {
    const question: Question = {
      _id: editingQuestion?._id || uuidv4(),
      quizId,
      type: questionType,
      content: values.content,
      timeLimit: Number(values.timeLimit),
      createdAt: editingQuestion?.createdAt || now,
      updatedAt: now,
      answers: [],
      points: Number(values.points),
      title: values.content, // Assuming title is the same as content
      options: [],
      correctAnswer: String(values.correctIndexes || "") ,
    };

    const mediaObject: Media = {};
    if (values.imageUrl && values.imageUrl.trim() !== '') {
        mediaObject.image = values.imageUrl;
    }
    if (values.videoUrl && values.videoUrl.trim() !== '') {
        mediaObject.video = values.videoUrl;
    }

    if (Object.keys(mediaObject).length > 0) {
        question.media = mediaObject;
    } else {
        question.media = undefined;
    }

    if (questionType === "multiple_choice") {
      const answerLines = (values.answers || "")
        .split("\n")
        .filter((line: string) => line.trim() !== "");

      question.answers = answerLines.map((text: string, index: number) => ({
        text,
        isCorrect: values.correctIndexes?.includes(index) ?? false,
      }));
    } else if (questionType === "true_false") {
      question.answers = [
        { text: "True", isCorrect: values.correctIndexes === 0 },
        { text: "False", isCorrect: values.correctIndexes === 1 },
      ];
    } else if (questionType === "poll") {
      question.answers = (values.answers || "")
        .split("\n")
        .filter((line: string) => line.trim() !== "")
        .map((text: string) => ({ text }));
    }

    if (questionType === "short_answer") {
      question.answerText = values.answerText;
    }

    if (questionType === "ordering") {
      question.correctOrder = (values.correctOrder || "")
        .split("\n")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    console.log("Question data being added (internal state):", question);
    onAdd(question);
    form.resetFields();
    setQuestionType("multiple_choice");
    form.setFieldsValue({ type: "multiple_choice", timeLimit: 30, content: "", answers: "", correctIndexes: [], answerText: "", correctOrder: "", points: 100, imageUrl: "", videoUrl: "" });
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

      <Form.Item label="Question Content" name="content" rules={[{ required: true, message: "Question content is required" }]}>
        <Input placeholder="Enter question content..." />
      </Form.Item>

      <Form.Item
        label="Points"
        name="points"
        rules={[{ required: true, validator: positiveNumberValidator }]}
      >
        <Input type="number" min={1} placeholder="Enter points for this question" />
      </Form.Item>

      <Form.Item label="Image URL" name="imageUrl">
        <Input placeholder="Optional: Enter image URL" />
      </Form.Item>

      <Form.Item label="Video URL" name="videoUrl">
        <Input placeholder="Optional: Enter video URL" />
      </Form.Item>

      {(questionType === "multiple_choice" || questionType === "poll") && (
        <>
          <Form.Item
            label="Answers (each line is one answer)"
            name="answers"
            rules={[{ required: true, message: "Please enter at least one answer" }]}
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

      {questionType === "true_false" && (
        <Form.Item
          label="Correct Answer"
          name="correctIndexes"
          rules={[{ required: true, message: "Please select the correct answer" }]}
        >
          <Select placeholder="Select correct answer">
            <Select.Option value={0}>True</Select.Option>
            <Select.Option value={1}>False</Select.Option>
          </Select>
        </Form.Item>
      )}

      {questionType === "short_answer" && (
        <Form.Item
          label="Correct Answer Text"
          name="answerText"
          rules={[{ required: true, message: "Correct answer text is required" }]}>
          <Input placeholder="Exact correct answer text" />
        </Form.Item>
      )}

      {questionType === "ordering" && (
        <Form.Item
          label="Correct Order (each line is one item)"
          name="correctOrder"
          rules={[{ required: true, message: "Correct order is required" }]}>
          <Input.TextArea rows={4} placeholder="Step 1\nStep 2\nStep 3" />
        </Form.Item>
      )}

      <Form.Item
        label="Time Limit (seconds)"
        name="timeLimit"
        rules={[{ required: true, validator: positiveNumberValidator }]}
      >
        <Input type="number" min={5} placeholder="Enter time limit (seconds)" />
      </Form.Item>

      <Button htmlType="submit" type="primary" className="rounded-md shadow-sm hover:shadow-md transition-all">
        {editingQuestion ? "Update Question" : "Add Question"}
      </Button>
    </Form>
  );
}