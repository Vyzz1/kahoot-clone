import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export function useQuestionFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy các giá trị từ URL
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = searchParams.get("sortOrder") || "";
  const type = searchParams.get("type") || ""; // Thêm type filter

  const setFilters = useCallback((filters: Record<string, any>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === "" || value === null) { // Xử lý null và undefined
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const getParamsString = () => searchParams.toString();

  const deleteAllFilters = useCallback(() => { // Sử dụng useCallback
    setSearchParams(() => new URLSearchParams());
  }, [setSearchParams]);

  const shouldResetFilters = Array.from(searchParams.entries()).some(
    ([key]) => !["page", "pageSize"].includes(key) // Kiểm tra các bộ lọc khác ngoài page và pageSize
  );

  return {
    search,
    page,
    pageSize,
    sortBy,
    sortOrder,
    type, // Trả về type
    setFilters,
    deleteAllFilters,
    getParamsString,
    shouldResetFilters,
  };
}
