import { Input } from "antd";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { useQuizFilter } from "../hooks/useQuizFilter";
import { SearchOutlined } from "@ant-design/icons"; // Import search icon

function SearchQuiz() {
  const { search, setFilters } = useQuizFilter();
  const [localSearch, setLocalSearch] = useState(search);
  const [debounced] = useDebounce(localSearch, 300);

  useEffect(() => {
    setFilters({ search: debounced, page: 0 });
  }, [debounced]);

  return (
    <Input
      placeholder="Search quizzes..."
      prefix={<SearchOutlined className="text-gray-400" />}
      style={{ width: 300 }}
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
      allowClear
      className="rounded-md shadow-sm"
    />
  );
}

export default SearchQuiz;
