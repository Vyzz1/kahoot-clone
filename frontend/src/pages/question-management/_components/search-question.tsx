import { Input } from "antd";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useQuestionFilter } from "../hooks/useQuestionFilter";

export default function SearchQuestion() {
  const { setFilters, search } = useQuestionFilter(); 
  const [searchText, setSearchText] = useState(search || ""); 
  const [debounced] = useDebounce(searchText, 300);

useEffect(() => {
  if (debounced !== search) {
    setFilters({ search: debounced, page: 0 });
  }
}, [debounced, search, setFilters]);


  return (
    <Input
      placeholder="Search questions..."
      style={{ width: 300 }}
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      allowClear
      className="rounded-md shadow-sm" 
    />
  );
}
