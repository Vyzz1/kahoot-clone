import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export interface GamePlayedFilters {
  sortBy?: string;
  sortOrder?: "ascend" | "descend";
  pageSize?: number;
  currentPage?: number;
  search?: string;
  statuses?: string[];
}

export function useGamePlayedFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder =
    (searchParams.get("sortOrder") as "ascend" | "descend") || "ascend";
  const pageSize = searchParams.get("pageSize")
    ? parseInt(searchParams.get("pageSize") || "10", 10)
    : 10;
  const currentPage = searchParams.get("currentPage")
    ? parseInt(searchParams.get("currentPage") || "1", 10)
    : 1;

  const statuses = searchParams.getAll("statuses") || [];

  const setFilters = useCallback(
    (filters: GamePlayedFilters) => {
      setSearchParams((params) => {
        const newParams = new URLSearchParams(params.toString());

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
    },
    [setSearchParams]
  );

  const deleteAllFilters = useCallback(() => {
    setSearchParams(() => {
      const newParams = new URLSearchParams();
      return newParams;
    });
  }, [setSearchParams]);

  const getParamsString = useCallback(() => {
    return searchParams.toString();
  }, [searchParams]);

  const shouldResetFilters =
    Array.from(searchParams.entries()).length > 0 &&
    Array.from(searchParams.entries()).some(
      ([key]) => key !== "currentPage" && key !== "pageSize"
    );

  return {
    search,
    sortBy,
    sortOrder,
    pageSize,
    currentPage,
    statuses,
    setFilters,
    deleteAllFilters,
    getParamsString,
    shouldResetFilters,
  };
}
