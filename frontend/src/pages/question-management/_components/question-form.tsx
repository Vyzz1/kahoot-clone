import { Form, Input, Select, Button, Upload, message, Checkbox, Space } from "antd"; // Import Space
import { UploadOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import type { Question, QuestionType } from "@/types/types"; // Removed NewQuestion import
import { useSaveQuestion } from "../hooks/useSaveQuestion";

const { TextArea } = Input;

interface QuizOption {
  _id: string;
  title: string;
}

interface QuestionFormProps {
  onAdd: (q: Question) => void;
  editingQuestion?: Question | null;
  quizId?: string;
  quizOptions?: QuizOption[];
  // Removed disabledQuizSelect?: boolean;
}

// Dummy upload function (replace with your actual upload logic)
const dummyUpload = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    }, 1000);
  });
};

export default function QuestionForm({
  onAdd,
  editingQuestion,
  // quizId,
  quizOptions = [],
  // Removed disabledQuizSelect = false,
}: QuestionFormProps) {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState<QuestionType>(
    editingQuestion?.type || "multiple_choice"
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(editingQuestion?.media?.image);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(editingQuestion?.media?.video);

  const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>(() => {
    // Khi chỉnh sửa, đọc từ answers (frontend type) và chuyển đổi thành options cho state nội bộ
    if (editingQuestion?.type === 'multiple_choice' || editingQuestion?.type === 'poll') {
      return editingQuestion.answers?.map(ans => ({ text: ans.text, isCorrect: ans.isCorrect || false })) || [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
    } else if (editingQuestion?.type === 'true_false') {
      return [
        { text: 'True', isCorrect: editingQuestion.answers?.some(a => a.text === 'True' && a.isCorrect) || false },
        { text: 'False', isCorrect: editingQuestion.answers?.some(a => a.text === 'False' && a.isCorrect) || false },
      ];
    }
    return [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
  });
  const { mutate } = useSaveQuestion();

  useEffect(() => {
    if (editingQuestion) {
      setQuestionType(editingQuestion.type);
      setImageUrl(editingQuestion.media?.image);
      setVideoUrl(editingQuestion.media?.video);
      form.setFieldsValue({
        quizId: editingQuestion.quizId,
        type: editingQuestion.type,
        content: editingQuestion.content,
        timeLimit: editingQuestion.timeLimit,
        answerText: editingQuestion.answerText,
        correctOrder: editingQuestion.correctOrder?.join('\n'),
        correctAnswer: editingQuestion.type === 'true_false'
            ? (editingQuestion.answers?.some(a => a.text === 'True' && a.isCorrect) ? true : editingQuestion.answers?.some(a => a.text === 'False' && a.isCorrect) ? false : undefined)
            : undefined,
      });
      if (editingQuestion.type === 'multiple_choice' || editingQuestion.type === 'poll') {
        setOptions(editingQuestion.answers?.map(ans => ({ text: ans.text, isCorrect: ans.isCorrect || false })) || [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
      } else if (editingQuestion.type === 'true_false') {
         setOptions([
           { text: 'True', isCorrect: editingQuestion.answers?.some(a => a.text === 'True' && a.isCorrect) || false },
           { text: 'False', isCorrect: editingQuestion.answers?.some(a => a.text === 'False' && a.isCorrect) || false },
         ]);
      }
    } else {
      form.resetFields();
      setQuestionType("multiple_choice");
      setImageUrl(undefined);
      setVideoUrl(undefined);
      setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    }
  }, [editingQuestion, form]);

  const onFinish = async (values: any) => {
    const payload: any = { // Sử dụng 'any' cho payload để linh hoạt cấu trúc trước khi gửi
      type: questionType,
      quizId: values.quizId, // Luôn sử dụng values.quizId từ form
      content: values.content,
      timeLimit: values.timeLimit ? parseInt(values.timeLimit, 10) : 30,
      media: {
        image: imageUrl,
        video: videoUrl,
      },
    };

    // Xử lý các câu trả lời dựa trên loại câu hỏi, ánh xạ sang 'options' cho backend
    if (questionType === 'multiple_choice' || questionType === 'poll') {
      const filteredOptions = options.filter(option => option.text.trim() !== '');
      if (filteredOptions.length < 2) {
        message.error('Please add at least two options for multiple choice/poll questions.');
        return;
      }
      if (questionType === 'multiple_choice' && !filteredOptions.some(opt => opt.isCorrect)) {
          message.error('Please mark at least one correct answer for multiple choice.');
          return;
      }
      payload.options = filteredOptions; // Gửi dưới dạng 'options'
    } else if (questionType === 'true_false') {
        const trueOption = { text: 'True', isCorrect: values.correctAnswer === true };
        const falseOption = { text: 'False', isCorrect: values.correctAnswer === false };
        payload.options = [trueOption, falseOption]; // Gửi dưới dạng 'options'
    } else if (questionType === 'short_answer') {
      if (!values.answerText || values.answerText.trim() === '') {
        message.error('Answer text is required for short answer questions.');
        return;
      }
      payload.answerText = values.answerText.trim();
    } else if (questionType === 'ordering') {
      const parsedOrder = values.correctOrder.split('\n').map((item: string) => item.trim()).filter((item: string) => item !== '');
      if (parsedOrder.length < 2) {
        message.error('Please add at least two items for ordering.');
        return;
      }
      payload.correctOrder = parsedOrder;
    }

    if (editingQuestion?._id) {
        payload._id = editingQuestion._id;
    }

    mutate(payload, { // Truyền payload đã được cấu trúc
      onSuccess: (data) => {
        message.success(editingQuestion ? 'Question updated successfully!' : 'Question added successfully!');
        onAdd?.(data);
        form.resetFields();
        setQuestionType("multiple_choice");
        setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
        setImageUrl(undefined);
        setVideoUrl(undefined);
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Failed to save question.';
        message.error(errorMessage);
        console.error("Error saving question:", error);
      },
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      // initialValues={{
      //   type: "multiple_choice",
      //   timeLimit: 30, // Initial value for timeLimit is set here
      //   quizId: quizId || editingQuestion?.quizId, // Set initial quizId if provided or from editingQuestion
      // }}
    >
      {/* Always render Select Quiz */}
      <Form.Item
        label="Select Quiz"
        name="quizId"
        rules={[{ required: true, message: "Please select a quiz!" }]}
      >
        {/* Removed disabled={disabledQuizSelect} to allow changing quiz */}
        <Select placeholder="Select a quiz">
          {quizOptions.map((option) => (
            <Select.Option key={option._id} value={option._id}>
              {option.title}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Question Type" name="type">
        <Select value={questionType} onChange={(value: QuestionType) => {
            setQuestionType(value);
            if (value === 'multiple_choice' || value === 'poll') {
                setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
            } else if (value === 'true_false') {
                 setOptions([
                   { text: 'True', isCorrect: false },
                   { text: 'False', isCorrect: false },
                 ]);
            } else {
                 setOptions([]);
            }
            form.resetFields(['answerText', 'correctOrder', 'correctAnswer']); // Reset relevant fields
        }}>
          <Select.Option value="multiple_choice">Multiple Choice</Select.Option>
          <Select.Option value="true_false">True/False</Select.Option>
          <Select.Option value="short_answer">Short Answer</Select.Option>
          <Select.Option value="ordering">Ordering</Select.Option>
          <Select.Option value="poll">Poll</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Question Content"
        name="content"
        rules={[{ required: true, message: "Please input the question content!" }]}
      >
        <TextArea rows={4} />
      </Form.Item>

      {(questionType === "multiple_choice" || questionType === "poll") && (
        <>
          {options.map((option, index) => (
            <Form.Item
              key={index}
              label={`Option ${index + 1}`}
              required={true}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  style={{ width: questionType === "multiple_choice" ? 'calc(100% - 100px)' : 'calc(100% - 50px)' }}
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index].text = e.target.value;
                    setOptions(newOptions);
                  }}
                  placeholder={`Enter Option ${index + 1}`}
                />
                {questionType === "multiple_choice" && (
                    <Checkbox
                        checked={option.isCorrect}
                        onChange={(e) => {
                            const newOptions = [...options];
                            newOptions[index].isCorrect = e.target.checked;
                            setOptions(newOptions);
                        }}
                        style={{ marginLeft: 8 }}
                    >
                        Correct
                    </Checkbox>
                )}
                {(options.length > 2 || (options.length === 2 && index === 1 && options[0].text.trim() !== '')) && (
                    <Button
                        danger
                        icon={<MinusOutlined />}
                        onClick={() => {
                            const newOptions = options.filter((_, i) => i !== index);
                            setOptions(newOptions);
                        }}
                        style={{ marginLeft: 8 }}
                    />
                )}
              </Space.Compact>
            </Form.Item>
          ))}
          <Button type="dashed" onClick={() => setOptions([...options, { text: '', isCorrect: false }])} block icon={<PlusOutlined />}>
            Add Option
          </Button>
        </>
      )}

      {questionType === "true_false" && (
        <Form.Item
          label="Correct Answer"
          name="correctAnswer"
          rules={[{ required: true, message: "Please select the correct answer!" }]}
        >
          <Select placeholder="Select True or False">
            <Select.Option value={true}>True</Select.Option>
            <Select.Option value={false}>False</Select.Option>
          </Select>
        </Form.Item>
      )}

      {questionType === "short_answer" && (
        <Form.Item
          label="Correct Answer Text"
          name="answerText"
          rules={[{ required: true, message: "Please enter the correct answer!" }]}
        >
          <Input />
        </Form.Item>
      )}

      {questionType === "ordering" && (
        <Form.Item
          label="Correct Order"
          name="correctOrder"
          rules={[{ required: true, message: "Please enter the correct order!" }]}
        >
          <TextArea rows={4} placeholder={"Item 1\nItem 2\nItem 3 (one item per line)"} />
        </Form.Item>
      )}

      <Form.Item label="Time Limit (seconds)" name="timeLimit">
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

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {editingQuestion ? "Update Question" : "Add Question"}
        </Button>
      </Form.Item>
    </Form>
  );
}
