import { useParams } from "react-router-dom";
import useFetchData from "@/hooks/useFetchData";
import { Typography, Spin, Empty, Tag } from "antd"; // Import Tag

// TẠM THỜI: Cập nhật định nghĩa kiểu Question để bao gồm imageUrl và videoUrl.
// Bạn NÊN cập nhật định nghĩa này trong tệp src/types/types.ts của mình.
interface Question {
  _id: string;
  quizId: string;
  title: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "ordering" | "poll";
  timeLimit: number;
  answers?: { text: string; isCorrect: boolean }[];
  correctOrder?: string[];
  answerText?: string;
  imageUrl?: string; // Thêm thuộc tính imageUrl
  videoUrl?: string; // Thêm thuộc tính videoUrl
  // Thêm các thuộc tính Question khác nếu có
}

const { Title } = Typography;

const getColorByType = (type: string) => {
  switch (type) {
    case "multiple_choice":
      return "blue";
    case "true_false":
      return "green";
    case "poll":
      return "gold";
    case "ordering":
      return "purple";
    case "short_answer":
      return "red";
    default:
      return "default";
  }
};

export default function QuestionListByQuiz() {
  const { quizId } = useParams();

  const { data, isLoading, error } = useFetchData<Question[]>(`/questions?quizId=${quizId}`, { type: "private" }); // Ensure type is private

  return (
    <section className="max-w-5xl mx-auto p-4 space-y-6 bg-gray-50 min-h-screen rounded-xl shadow-md">
      <Title level={3} className="text-gray-800 mb-6">
        📝 Questions for Quiz: <span className="font-semibold text-blue-600">{quizId}</span> {/* Changed to English */}
      </Title>

      {isLoading ? (
        <div className="text-center py-16">
          <Spin size="large" tip="Loading questions..." /> {/* Changed to English */}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-16">
          {error.response?.data?.message || "Error loading questions!"} {/* Changed to English */}
        </div>
      ) : data && data.length > 0 ? (
        <ul className="space-y-4">
          {data.map((q, index) => (
            <li key={q._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-lg text-gray-800">
                  {index + 1}. {q.title}
                </div>
                <Tag color={getColorByType(q.type)} className="ml-2 rounded-full px-3 py-1 text-xs font-semibold">
                  {q.type.replace("_", " ").toUpperCase()}
                </Tag>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Time Limit: <span className="font-medium">{q.timeLimit}s</span> {/* Changed to English */}
              </div>

              {/* Display answers based on type */}
              {q.answers && q.answers.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-gray-700">Answers:</p> 
                  <ul className="list-disc ml-6 text-sm text-gray-700">
                    {q.answers.map((a, i) => (
                      <li
                        key={i}
                        className={a.isCorrect ? "font-bold text-green-600" : ""}
                      >
                        {a.text} {a.isCorrect && "(Correct)"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {q.correctOrder && (
                <div className="mt-2">
                  <p className="font-semibold text-gray-700">Correct Order:</p> 
                  <ol className="list-decimal ml-6 text-sm text-gray-700">
                    {q.correctOrder.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {q.answerText && (
                <div className="mt-2">
                  <p className="font-semibold text-gray-700">Correct Answer:</p> 
                  <p className="ml-6 text-sm text-gray-700 font-bold text-green-600">{q.answerText}</p>
                </div>
              )}

              {q.imageUrl && (
                <div className="mt-4">
                  <p className="font-semibold text-gray-700 mb-2">Image:</p> 
                  <img src={q.imageUrl} alt="Question Image" className="max-w-full h-auto rounded-md shadow-sm" />
                </div>
              )}

              {q.videoUrl && (
                <div className="mt-4">
                  <p className="font-semibold text-gray-700 mb-2">Video:</p> 
                  <video src={q.videoUrl} controls className="max-w-full h-auto rounded-md shadow-sm" />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Empty description="No questions for this quiz." className="py-12" />
      )}
    </section>
  );
}
