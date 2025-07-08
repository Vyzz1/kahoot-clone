interface ApiError extends AxiosError {
  response?: {
    data: {
      message?: string;
    };
    status: number;
    statusText: string;
    headers: any;
    config: any;
  };
}
