import { Input } from "antd";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useQuestionFilter } from "../hooks/useQuestionFilter";

export default function SearchQuestion() {
  const { setFilters } = useQuestionFilter();
  const [searchText, setSearchText] = useState("");
  const [debounced] = useDebounce(searchText, 300);

  useEffect(() => {
    setFilters({ search: debounced });
  }, [debounced]);

  return (
    <Input
      placeholder="Search questions..."
      style={{ width: 300 }}
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      allowClear
    />
  );
}
