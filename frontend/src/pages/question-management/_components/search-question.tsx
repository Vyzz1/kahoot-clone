import { Input } from "antd";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useQuestionFilter } from "../hooks/useQuestionFilter";

export default function SearchQuestion() {
  const { setFilters, search } = useQuestionFilter(); // Lấy giá trị search hiện tại từ hook
  const [searchText, setSearchText] = useState(search || ""); // Khởi tạo với giá trị search từ URL
  const [debounced] = useDebounce(searchText, 300);

  useEffect(() => {
    setFilters({ search: debounced, page: 0 }); // Reset page về 0 khi tìm kiếm
  }, [debounced, setFilters]);

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
