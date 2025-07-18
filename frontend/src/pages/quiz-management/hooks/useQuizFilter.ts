import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export interface QuizFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  tags?: string[];
  questionType?: string;
  isPublic?: boolean | string; // Thêm trường isPublic, có thể là boolean hoặc string "all"
}

export function useQuizFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const tags = searchParams.getAll("tags");
  const questionType = searchParams.get("questionType") || "";
  // Lấy giá trị isPublic từ URL. Nếu không có, mặc định là "all" để hiển thị tất cả.
  // Nếu là "true", chuyển thành true. Nếu là "false", chuyển thành false.
  const isPublicParam = searchParams.get("isPublic");
  const isPublic = isPublicParam === null ? "all" : (isPublicParam === "true");


  const setFilters = useCallback((filters: QuizFilters) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev.toString());

      for (const [key, value] of Object.entries(filters)) {
        if (key === "isPublic") {
          if (value === "all") {
            newParams.delete(key); // Xóa param nếu là "all"
          } else {
            newParams.set(key, String(value));
          }
        } else if (!value) {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          newParams.delete(key);
          value.forEach((v) => newParams.append(key, v));
        } else {
          newParams.set(key, String(value));
        }
      }

      return newParams;
    });
  }, [setSearchParams]);

  const getParamsString = () => searchParams.toString();

  const deleteAllFilters = useCallback(() => {
    setSearchParams(() => new URLSearchParams());
  }, [setSearchParams]);

  // Kiểm tra xem có bộ lọc nào khác ngoài page và pageSize không
  const shouldResetFilters =
    Array.from(searchParams.entries()).some(([k]) => !["page", "pageSize"].includes(k));

  return {
    search,
    page,
    pageSize,
    tags,
    questionType,
    isPublic, // Trả về isPublic
    setFilters,
    deleteAllFilters,
    getParamsString,
    shouldResetFilters,
  };
}
