import type { AxiosError } from "axios";

export type ApiError = AxiosError<{
  message?: string;
  statusCode?: number;
  // Bạn có thể thêm các field backend trả về, ví dụ:
  // errors?: string[];
}>;
