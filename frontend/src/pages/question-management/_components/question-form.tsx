import { Form, Input, Select, Button, Upload, message, Checkbox } from "antd";
import { UploadOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import type { NewQuestion, Question, QuestionType } from "@/types/types";
import { useSaveQuestion } from "../hooks/useSaveQuestion";
// import { useNavigate } from "react-router-dom";

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
  disabledQuizSelect?: boolean;
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
  quizId,
  quizOptions = [],
  disabledQuizSelect = false,
}: QuestionFormProps) {
  const [form] = Form.useForm();
  // const navigate = useNavigate();
  const [questionType, setQuestionType] = useState<QuestionType>(
    editingQuestion?.type || "multiple_choice"
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(editingQuestion?.media?.image);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(editingQuestion?.media?.video);

  const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>(() => {
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
    const baseQuestionData: Partial<NewQuestion> = {
      type: questionType,
      quizId: quizId || values.quizId,
      content: values.content,
      timeLimit: values.timeLimit ? parseInt(values.timeLimit, 10) : 30,
      media: {
        image: imageUrl,
        video: videoUrl,
      },
      answerText: undefined,
      correctOrder: undefined,
    };

    const finalQuestionData: Partial<Question> = { ...baseQuestionData }; // Changed let to const

    // Handle options based on question type
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
      finalQuestionData.options = filteredOptions;
    } else if (questionType === 'true_false') {
        const trueOption = { text: 'True', isCorrect: values.correctAnswer === true };
        const falseOption = { text: 'False', isCorrect: values.correctAnswer === false };
        finalQuestionData.options = [trueOption, falseOption];
    } else if (questionType === 'short_answer') {
      if (!values.answerText || values.answerText.trim() === '') {
        message.error('Answer text is required for short answer questions.');
        return;
      }
      finalQuestionData.answerText = values.answerText.trim();
    } else if (questionType === 'ordering') {
      const parsedOrder = values.correctOrder.split('\n').map((item: string) => item.trim()).filter((item: string) => item !== '');
      if (parsedOrder.length < 2) {
        message.error('Please add at least two items for ordering.');
        return;
      }
      finalQuestionData.correctOrder = parsedOrder;
    }

    if (editingQuestion?._id) {
        finalQuestionData._id = editingQuestion._id;
    }

    mutate(finalQuestionData as Question, {
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
      initialValues={{
        type: "multiple_choice",
        timeLimit: 30,
      }}
    >
      {!quizId && (
        <Form.Item
          label="Select Quiz"
          name="quizId"
          rules={[{ required: true, message: "Please select a quiz!" }]}
          hidden={disabledQuizSelect}
        >
          <Select placeholder="Select a quiz" disabled={disabledQuizSelect}>
            {quizOptions.map((option) => (
              <Select.Option key={option._id} value={option._id}>
                {option.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}

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
            form.resetFields(['answerText', 'correctOrder']);
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
              <Input.Group compact>
                <Input
                  style={{ width: questionType === "multiple_choice" ? 'calc(100% - 40px)' : '100%' }}
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
                {(options.length > 2 || (options.length === 2 && index === 1)) && (
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
              </Input.Group>
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
          initialValue={editingQuestion?.answers?.some(a => a.text === 'True' && a.isCorrect) ? true : editingQuestion?.answers?.some(a => a.text === 'False' && a.isCorrect) ? false : undefined}
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

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {editingQuestion ? "Update Question" : "Add Question"}
        </Button>
      </Form.Item>
    </Form>
  );
}
