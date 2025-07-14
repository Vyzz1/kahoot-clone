import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export interface QuizFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: "ascend" | "descend";
  statuses?: string[];
  currentPage?: number;
  pageSize?: number;
}

export function useQuizFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = (searchParams.get("sortOrder") as "ascend" | "descend") || "ascend";
  const statuses = searchParams.getAll("isPublic");
  const currentPage = parseInt(searchParams.get("currentPage") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const setFilters = useCallback((filters: QuizFilters) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev.toString());

      for (const [key, value] of Object.entries(filters)) {
        if (!value) {
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
  }, []);

  const getParamsString = () => searchParams.toString();

  const deleteAllFilters = useCallback(() => {
    setSearchParams(() => new URLSearchParams());
  }, []);

  const shouldResetFilters =
    Array.from(searchParams.entries()).length > 0 &&
    Array.from(searchParams.entries()).some(([k]) => k !== "currentPage" && k !== "pageSize");

  return {
    search,
    sortBy,
    sortOrder,
    statuses,
    currentPage,
    pageSize,
    setFilters,
    deleteAllFilters,
    getParamsString,
    shouldResetFilters,
  };
}
