import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { type AxiosInstance } from "axios";
import useAxiosPrivate from "./useAxiosPrivate";
import axios from "@/api/axios";
import type { ApiError } from "@/types/error";

export const fetchData = async <T>(
  customAxios: AxiosInstance,
  endpoint: string
): Promise<T> => {
  try {
    const response = await customAxios.get<T>(endpoint);
    return response.data;
  } catch (error) {
    const axiosError = error as ApiError;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch data"
    );
  }
};

interface FetchDataOptions<T>
  extends Omit<UseQueryOptions<T, ApiError>, "queryKey" | "queryFn"> {
  uniqueKey?: QueryKey;
  enabled?: boolean;
  type?: "private" | "normal";
}

const useFetchData = <T>(
  endpoint: string,
  options: FetchDataOptions<T> = {}
) => {
  const {
    uniqueKey,
    enabled = true,
    type = "normal",
    ...queryOptions
  } = options;

  const axiosPrivate = useAxiosPrivate({ type: "private" });

  return useQuery<T, ApiError>({
    queryKey: uniqueKey!,
    queryFn: async () =>
      fetchData<T>(type === "normal" ? axios : axiosPrivate, endpoint),
    enabled,

    retry: (failureCount, error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    ...queryOptions,
  });
};

export default useFetchData;
