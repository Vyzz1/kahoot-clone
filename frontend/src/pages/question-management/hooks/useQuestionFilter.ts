// src/hooks/useQuestionFilter.ts
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export interface QuestionFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | undefined; 
  type?: string;
  quizId?: string;
}

export function useQuestionFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = (searchParams.get("sortOrder") as "ascend" | "descend") || undefined;
  const type = searchParams.get("type") || "";
  const quizId = searchParams.get("quizId") || ""; // Lấy quizId từ URL

  const setFilters = useCallback(
    (filters: QuestionFilters) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev.toString());

        for (const [key, value] of Object.entries(filters)) {
          if (value === undefined || value === null || value === "") {
            newParams.delete(key);
          } else {
            newParams.set(key, String(value));
          }
        }
        return newParams;
      });
    },
    [setSearchParams]
  );

  const getParamsString = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (page !== 0) params.set("page", String(page)); // Chỉ thêm nếu khác 0
    if (pageSize !== 10) params.set("pageSize", String(pageSize)); // Chỉ thêm nếu khác 10
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    if (type) params.set("type", type);
    if (quizId) params.set("quizId", quizId); // Thêm quizId vào params string

    return params.toString();
  }, [search, page, pageSize, sortBy, sortOrder, type, quizId]);

  const deleteAllFilters = useCallback(() => {
    setSearchParams(() => new URLSearchParams());
  }, [setSearchParams]);

  const shouldResetFilters = Array.from(searchParams.entries()).some(
    ([key]) => !["page", "pageSize"].includes(key)
  );

  const filters: QuestionFilters = {
  search,
  page,
  pageSize,
  sortBy,
  type,
  quizId,
};


  return {
    search,
    page,
    pageSize,
    sortBy,
    sortOrder,
    type,
    quizId,
    filters,
    setFilters,
    getParamsString,
    deleteAllFilters,
    shouldResetFilters,
  };
}