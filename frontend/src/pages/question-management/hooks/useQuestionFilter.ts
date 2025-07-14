import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export function useQuestionFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const setFilters = useCallback((filters: Record<string, any>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === "") newParams.delete(key);
      else newParams.set(key, String(value));
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const getParamsString = () => searchParams.toString();

  const deleteAllFilters = () => setSearchParams(() => new URLSearchParams());

  const shouldResetFilters = Array.from(searchParams.entries()).some(
    ([key]) => key !== "currentPage" && key !== "pageSize"
  );

  return {
    setFilters,
    deleteAllFilters,
    getParamsString,
    shouldResetFilters,
  };
}
