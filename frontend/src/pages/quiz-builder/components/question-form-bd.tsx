import { Form, Input, Select, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { UploadFile } from "antd/es/upload/interface";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate"; 
import useSubmitData from "../../../hooks/useSubmitData"; 
import { useQueryClient } from "@tanstack/react-query";

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
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const axiosPrivateUpload = useAxiosPrivate({ type: "upload" });
  const queryClient = useQueryClient();

  const { mutate, isPending } = useSubmitData( `/quizzes/${quizId}/questions`, 
    (data: any) => {
      message.success(`Question ${editingQuestion ? "updated" : "added"} successfully.`);
      const newQuestion = data as Question & Partial<{ answerText: string; correctOrder: string[] }>;
      onAdd(newQuestion);
      form.resetFields();
      setQuestionType("multiple_choice");
      form.setFieldsValue({
        type: "multiple_choice",
        timeLimit: 30,
        content: "",
        answers: "",
        correctIndexes: [],
        answerText: "",
        correctOrder: "",
        points: 100
      });
      setImageUrl(undefined);
      setVideoUrl(undefined);

      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
    (error: any) => {
      message.error(`Failed to ${editingQuestion ? "update" : "add"} question: ${error.message}`);
    }
  );

  const handleCustomUpload = async (options: any, setFileUrl: (url: string | undefined) => void) => {
    const { file, onSuccess, onError, onProgress } = options;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosPrivateUpload.post('/upload', formData, {
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress({ percent });
          }
        },
      });

      const { publicUrl } = response.data;
      message.success(`${file.name} file uploaded successfully.`);
      setFileUrl(publicUrl);
      onSuccess(response.data);
    } catch (err: any) {
      message.error(`${file.name} file upload failed: ${err.message}`);
      onError(err);
    }
  };

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
      const answerTexts = editingQuestion.options?.map((a) => a.text) || [];
      const correctIndexes =
        editingQuestion.options
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
      });

      setImageUrl(editingQuestion.media?.image);
      setVideoUrl(editingQuestion.media?.video);
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
      });
      setQuestionType("multiple_choice");
      setImageUrl(undefined);
      setVideoUrl(undefined);
    }
  }, [editingQuestion, form]);

  const now = new Date().toISOString();

  const onFinish = (values: any) => {
    const question: any = {
      quizId,
      type: questionType,
      content: values.content,
      timeLimit: Number(values.timeLimit),
      createdAt: editingQuestion?.createdAt || now,
      updatedAt: now,
      points: Number(values.points),
      options: [],
    };

    const mediaObject: Media = {};
    if (imageUrl) {
      mediaObject.image = imageUrl;
    }
    if (videoUrl) {
      mediaObject.video = videoUrl;
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

      question.options = answerLines.map((text: string, index: number) => ({
        _id: uuidv4(),
        text,
        isCorrect: values.correctIndexes?.includes(index) ?? false,
      }));
    } else if (questionType === "true_false") {
      question.options = [
        { _id: uuidv4(), text: "True", isCorrect: values.correctIndexes === 0 },
        { _id: uuidv4(), text: "False", isCorrect: values.correctIndexes === 1 },
      ];
    } else if (questionType === "poll") {
      question.options = (values.answers || "")
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

    const type = editingQuestion ? "patch" : "post";
    const endpoint = editingQuestion ? `/quizzes/${quizId}/questions/${editingQuestion._id}` : `/quizzes/${quizId}/questions`;
    mutate({ data: question, type, endpoint });
  };
  
  const handleRemoveImage = () => {
    setImageUrl(undefined);
  };
  
  const handleRemoveVideo = () => {
    setVideoUrl(undefined);
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

      <Form.Item label="Image (optional)">
        <Upload
          customRequest={(options) => handleCustomUpload(options, setImageUrl)}
          listType="picture"
          accept="image/*"
          maxCount={1}
          fileList={imageUrl ? [{ uid: '-1', name: 'image.png', status: 'done', url: imageUrl } as UploadFile] : []}
          onRemove={handleRemoveImage}
        >
          {!imageUrl && <Button icon={<UploadOutlined />}>Upload Image</Button>}
        </Upload>
      </Form.Item>

      <Form.Item label="Video (optional)">
        <Upload
          customRequest={(options) => handleCustomUpload(options, setVideoUrl)}
          listType="picture"
          accept="video/*"
          maxCount={1}
          fileList={videoUrl ? [{ uid: '-1', name: 'video.mp4', status: 'done', url: videoUrl } as UploadFile] : []}
          onRemove={handleRemoveVideo}
        >
          {!videoUrl && <Button icon={<UploadOutlined />}>Upload Video</Button>}
        </Upload>
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

      <Button htmlType="submit" type="primary" loading={isPending} className="rounded-md shadow-sm hover:shadow-md transition-all">
        {editingQuestion ? "Update Question" : "Add Question"}
      </Button>
    </Form>
  );
} 