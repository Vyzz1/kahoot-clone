import { Form, Input, Select, Button, Upload, message, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { UploadFile } from "antd/es/upload/interface";
import axios from 'axios';
import useSubmitData from "../../../hooks/useSubmitData";
// import { Axios } from "../../../api/axios";
// import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const { Title } = Typography;

interface QuizOption {
  _id: string;
  title: string;
}

interface QuestionFormProps {
  quizId?: string;
  quizOptions?: QuizOption[];
  onAdd: (q: Question & Partial<{ answerText: string; correctOrder: string[] }>) => void;
  editingQuestion?: (Question & Partial<{ answerText: string; correctOrder: string[] }>) | null;
}

export default function QuestionForm({
  quizId,
  onAdd,
  editingQuestion,
  quizOptions = [],
}: QuestionFormProps) {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [quizName, setQuizName] = useState<string>("");

  const [displayQuizOptions, setDisplayQuizOptions] = useState<QuizOption[]>(quizOptions);  

  

  const {
    mutate: uploadMutate,
    isPending: isUploading,
  } = useSubmitData(
    "/upload",
    (data) => {
      console.log("Upload successful:", data);
    },
    (error) => {
      console.error("Upload failed:", error);
    },
    "upload"
  );

  const onUpload = (options: any, setFileUrl: (url: string | undefined) => void) => {
    const { file } = options;
    const formData = new FormData();
    formData.append('file', file);
  
    uploadMutate({
      endpoint: "/upload",
      data: formData,
      type: "post",
    }, {
      onSuccess: (data: any) => {
        const { publicUrl } = data;
        message.success(`${file.name} file uploaded successfully.`);
        setFileUrl(publicUrl);
        options.onSuccess(data);
      },
      onError: (err: any) => {
        message.error(`${file.name} file upload failed: ${err.message}`);
        options.onError(err);
      },
    });
  };

useEffect(() => {
  const currentOptions = [...quizOptions];

  const currentQuizId = editingQuestion?.quizId || quizId;

  if (!currentQuizId) {
    setQuizName("No Quiz Selected");
    setDisplayQuizOptions(currentOptions);
    return;
  }

  const fetchAndSetQuizDetails = async () => {
    try {
      const res = await axios.get(`/api/quizzes/${currentQuizId}`);
      const quizData = res.data;

      if (quizData) {
        setQuizName(quizData.title || "Untitled Quiz");

        const isQuizInOptions = currentOptions.some(q => q._id === currentQuizId);

        if (!isQuizInOptions) {
          const newOption: QuizOption = { _id: quizData._id, title: quizData.title };
          currentOptions.unshift(newOption);
        }
      } else {
         setQuizName("Unknown Quiz");
      }
    } catch (err) {
      console.error("Failed to fetch quiz:", err);
      setQuizName("Unknown Quiz");
    } finally {
        setDisplayQuizOptions(currentOptions);
    }
  };

  fetchAndSetQuizDetails();

}, [editingQuestion, quizId, quizOptions]); 

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
        quizId: editingQuestion.quizId,
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
        quizId: quizId,
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
      setImageUrl(undefined);
      setVideoUrl(undefined);
    }
  }, [editingQuestion, form, quizId]);

  const now = new Date().toISOString();

  const onFinish = (values: any) => {
    const question: Question = {
      _id: editingQuestion?._id || uuidv4(),
      quizId: values.quizId,
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

    console.log("Question data being added (internal state):", question);
    onAdd(question);
    form.resetFields();
    setQuestionType("multiple_choice");
    form.setFieldsValue({
      quizId: editingQuestion ? editingQuestion.quizId : quizId,
      type: "multiple_choice",
      timeLimit: 30,
      content: "",
      answers: "",
      correctIndexes: [],
      answerText: "",
      correctOrder: "",
      points: 100,
    });
    setImageUrl(undefined);
    setVideoUrl(undefined);
  };
  
  const handleRemoveImage = () => {
    setImageUrl(undefined);
  };
  
  const handleRemoveVideo = () => {
    setVideoUrl(undefined);
  };

  return (
    <>
      <Title level={4} style={{ marginBottom: 16 }}>
        Quiz: {quizName}
      </Title>
    <Form layout="vertical" onFinish={onFinish} form={form}>
  <Form.Item
    label="Select Quiz"
    name="quizId"
    rules={[{ required: false, message: "Please select a quiz!" }]}
  >
    <Select disabled={!!editingQuestion} placeholder="Select a quiz">
      {displayQuizOptions.map((option) => ( 
        <Select.Option key={option._id} value={option._id}>
          {option.title}
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
      
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
          customRequest={(options) => onUpload(options, setImageUrl)}
          listType="picture"
          accept="image/*"
          maxCount={1}
          fileList={imageUrl ? [{ uid: '-1', name: 'image.png', status: 'done', url: imageUrl } as UploadFile] : []}
          onRemove={handleRemoveImage}
        >
          {!imageUrl && <Button icon={<UploadOutlined />} loading={isUploading}>Upload Image</Button>}
        </Upload>
      </Form.Item>

      <Form.Item label="Video (optional)">
        <Upload
          customRequest={(options) => onUpload(options, setVideoUrl)}
          listType="picture"
          accept="video/*"
          maxCount={1}
          fileList={videoUrl ? [{ uid: '-1', name: 'video.mp4', status: 'done', url: videoUrl } as UploadFile] : []}
          onRemove={handleRemoveVideo}
        >
          {!videoUrl && <Button icon={<UploadOutlined />} loading={isUploading}>Upload Video</Button>}
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

      <Button htmlType="submit" type="primary" className="rounded-md shadow-sm hover:shadow-md transition-all">
        {editingQuestion ? "Update Question" : "Add Question"}
      </Button>
    </Form>
    </>
  );
}