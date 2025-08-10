import { Input } from "antd";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useQuestionFilter } from "../hooks/useQuestionFilter";

export default function SearchQuestion() {
  const { setFilters, search } = useQuestionFilter(); // Lấy giá trị search hiện tại từ hook
  const [searchText, setSearchText] = useState(search || ""); // Khởi tạo với giá trị search từ URL
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
      className="rounded-md shadow-sm" // Thêm style
    />
  );
}
