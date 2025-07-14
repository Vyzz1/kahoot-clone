import { Input } from "antd";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { useQuizFilter } from "../hooks/useQuizFilter";

function SearchQuiz() {
  const { search, setFilters } = useQuizFilter();
  const [localSearch, setLocalSearch] = useState(search);
  const [debounced] = useDebounce(localSearch, 300);

  useEffect(() => {
    setFilters({ search: debounced, currentPage: 1 });
  }, [debounced]);

  return (
    <Input
      placeholder="Search quizzes..."
      style={{ width: 300 }}
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
    />
  );
}

export default SearchQuiz;
