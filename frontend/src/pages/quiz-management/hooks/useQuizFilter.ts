import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export interface QuizFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  tags?: string[];
  questionType?: string;
  isPublic?: boolean | string;
}

export function useQuizFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const tags = searchParams.getAll("tags");
  const questionType = searchParams.get("questionType") || "";
  const isPublicParam = searchParams.get("isPublic");
  const isPublic = isPublicParam === null ? "all" : (isPublicParam === "true");


  const setFilters = useCallback((filters: QuizFilters) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev.toString());

      for (const [key, value] of Object.entries(filters)) {
        if (key === "isPublic") {
          if (value === "all") {
            newParams.delete(key);
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

  const shouldResetFilters =
    Array.from(searchParams.entries()).some(([k]) => !["page", "pageSize"].includes(k));

  return {
    search,
    page,
    pageSize,
    tags,
    questionType,
    isPublic,
    setFilters,
    deleteAllFilters,
    getParamsString,
    shouldResetFilters,
  };
}
