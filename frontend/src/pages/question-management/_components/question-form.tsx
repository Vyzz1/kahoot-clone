import { Form, Input, Select, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import type { Question, QuestionType } from "@/types/types";
import { v4 as uuidv4 } from "uuid";

const { TextArea } = Input;

interface QuestionFormProps {
  onAdd: (q: Question) => void;
  editingQuestion?: Question | null;
  quizId: string;
}

export default function QuestionForm({ onAdd, editingQuestion, quizId }: QuestionFormProps) {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState<QuestionType>(
    editingQuestion?.type || "multiple_choice"
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | undefined>();

  useEffect(() => {
    if (editingQuestion) {
      setQuestionType(editingQuestion.type);
      setImageUrl(editingQuestion.image);
      setVideoUrl(editingQuestion.video);

      form.setFieldsValue({
        title: editingQuestion.title,
        answers: editingQuestion.answers?.map((a) => a.text).join("\n"),
        correctIndex: editingQuestion.answers?.findIndex((a) => a.isCorrect) ?? 0,
        timeLimit: editingQuestion.timeLimit,
        answerText: editingQuestion.answerText,
        correctOrder: editingQuestion.correctOrder?.join("\n"),
      });
    } else {
      form.resetFields();
      setImageUrl(undefined);
      setVideoUrl(undefined);
      setQuestionType("multiple_choice");
    }
  }, [editingQuestion]);

  const onFinish = (values: any) => {
    const now = new Date().toISOString();
    const base: Question = {
      _id: editingQuestion?._id || uuidv4(),
      type: questionType,
      title: values.title,
      quizId,
      timeLimit: values.timeLimit,
      image: imageUrl,
      video: videoUrl,
      createdAt: editingQuestion?.createdAt || now,
      updatedAt: now,
      answers: [],
    };

    switch (questionType) {
      case "multiple_choice":
      case "poll": {
        const answers = values.answers
          .split("\n")
          .map((t: string) => t.trim())
          .filter(Boolean);
        base.answers = answers.map((text: string, index: number) => ({
          text,
          isCorrect: questionType === "multiple_choice" && index === values.correctIndex,
        }));
        break;
      }
      case "true_false": {
        base.answers = [
          { text: "True", isCorrect: values.correctIndex === 0 },
          { text: "False", isCorrect: values.correctIndex === 1 },
        ];
        break;
      }
      case "short_answer":
        base.answerText = values.answerText;
        break;
      case "ordering":
        base.correctOrder = values.correctOrder
          .split("\n")
          .map((line: string) => line.trim())
          .filter(Boolean);
        break;
    }

    onAdd(base);
    message.success(editingQuestion ? "Updated question" : "Added question");
    form.resetFields();
    setImageUrl(undefined);
    setVideoUrl(undefined);
    setQuestionType("multiple_choice");
  };

  const dummyUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(file));
      }, 500);
    });
  };

  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <Form.Item label="Question Type" name="type" initialValue={questionType}>
        <Select
          value={questionType}
          onChange={(v: QuestionType) => {
            setQuestionType(v);
            form.resetFields();
            setImageUrl(undefined);
            setVideoUrl(undefined);
          }}
        >
          <Select.Option value="multiple_choice">Multiple Choice</Select.Option>
          <Select.Option value="true_false">True / False</Select.Option>
          <Select.Option value="short_answer">Short Answer</Select.Option>
          <Select.Option value="ordering">Ordering</Select.Option>
          <Select.Option value="poll">Poll</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Question Title" name="title" rules={[{ required: true }]}>
        <Input placeholder="Enter question title..." />
      </Form.Item>

      {(questionType === "multiple_choice" || questionType === "poll") && (
        <>
          <Form.Item
            label="Answers (one per line)"
            name="answers"
            rules={[{ required: true }]}
          >
            <TextArea placeholder={"Answer A\nAnswer B\nAnswer C"} rows={4} />
          </Form.Item>

          {questionType === "multiple_choice" && (
            <Form.Item
              label="Correct Answer Index"
              name="correctIndex"
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const lines = getFieldValue("answers")?.split("\n") || [];
                    if (value < 0 || value >= lines.length) {
                      return Promise.reject(
                        new Error(`Index must be between 0 and ${lines.length - 1}`)
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

      {questionType === "true_false" && (
        <Form.Item label="Correct Answer" name="correctIndex" initialValue={0} rules={[{ required: true }]}>
          <Select>
            <Select.Option value={0}>True</Select.Option>
            <Select.Option value={1}>False</Select.Option>
          </Select>
        </Form.Item>
      )}

      {questionType === "short_answer" && (
        <Form.Item label="Correct Answer Text" name="answerText" rules={[{ required: true }]}>
          <Input placeholder="Expected short answer..." />
        </Form.Item>
      )}

      {questionType === "ordering" && (
        <Form.Item label="Correct Order (one per line)" name="correctOrder" rules={[{ required: true }]}>
          <TextArea rows={4} placeholder={"Step 1\nStep 2\nStep 3"} />
        </Form.Item>
      )}

      <Form.Item label="Time Limit (seconds)" name="timeLimit" initialValue={30}>
        <Input type="number" min={5} max={300} />
      </Form.Item>

      <Form.Item label="Image (optional)">
        <Upload
          customRequest={async ({ file, onSuccess }) => {
            const url = await dummyUpload(file as File);
            setImageUrl(url);
            onSuccess?.("ok");
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Upload Image</Button>
        </Upload>
        {imageUrl && (
          <img src={imageUrl} alt="Preview" className="mt-2 max-h-40 rounded border" />
        )}
      </Form.Item>

      <Form.Item label="Video (optional)">
        <Upload
          customRequest={async ({ file, onSuccess }) => {
            const url = await dummyUpload(file as File);
            setVideoUrl(url);
            onSuccess?.("ok");
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Upload Video</Button>
        </Upload>
        {videoUrl && (
          <video src={videoUrl} controls className="mt-2 max-h-40 rounded border" />
        )}
      </Form.Item>

      <Button type="primary" htmlType="submit" block>
        {editingQuestion ? "Update Question" : "Add Question"}
      </Button>
    </Form>
  );
}
