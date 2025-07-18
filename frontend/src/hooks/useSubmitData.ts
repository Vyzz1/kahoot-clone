import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Axios, type AxiosResponse } from "axios";
import useAxiosPrivate from "./useAxiosPrivate"; // Assuming this hook exists and provides an Axios instance

type AxiosType = "post" | "patch" | "put" | "delete";

// Define the variables that will be passed to the mutate function
interface SubmitDataVariables {
  data?: Record<string | number, unknown>; // Optional data for POST/PUT/PATCH
  type: AxiosType;
  endpoint?: string; // Make endpoint optional here, so it can be overridden
}

const fetchData = async (
  axiosInstance: Axios, // Renamed from axiosPrivate for clarity
  url: string, // This will be the resolved endpoint
  body: Record<string | number, unknown> | undefined, // Body can be undefined for DELETE
  type: AxiosType
): Promise<unknown> => {
  const methods = {
    post: axiosInstance.post,
    patch: axiosInstance.patch,
    put: axiosInstance.put,
    delete: axiosInstance.delete,
  };

  try {
    let response: AxiosResponse;
    if (type === "delete") {
      // DELETE requests typically don't send a body in the request payload,
      // but Axios allows it for some APIs. If your backend expects a body for DELETE,
      // you might need to adjust this. For standard REST, body is omitted.
      response = await methods[type](url); 
    } else {
      response = await methods[type](url, body);
    }
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

const useSubmitData = (
  // This endpoint is now the DEFAULT endpoint. It can be overridden by mutate.
  defaultEndpoint: string = '', 
  onSuccessCallback: (data: unknown) => void,
  onErrorCallback?: (error: unknown) => void,
  typeAxiosPrivate: string = "private" // Renamed to avoid conflict with SubmitDataVariables 'type'
) => {
  const queryClient = useQueryClient();
  const axiosPrivate = useAxiosPrivate({ type: typeAxiosPrivate });

  return useMutation<unknown, Error, SubmitDataVariables>({
    mutationFn: async ({ data, type, endpoint }) => {
      // Use the endpoint provided in the mutate call, or fall back to the default
      const urlToUse = endpoint || defaultEndpoint; 

      if (!urlToUse) {
        throw new Error("No API endpoint provided for the mutation.");
      }

      return fetchData(axiosPrivate, urlToUse, data, type);
    },
    onSuccess: (data, variables) => { // 'variables' now contains 'endpoint'
      // Invalidate queries related to the specific endpoint used in the mutation
      // and also the general quizzes list
      queryClient.invalidateQueries({ queryKey: [variables.endpoint || defaultEndpoint] });
      queryClient.invalidateQueries({ queryKey: ["/quizzes"] }); 

      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (error: any) => {
      if (onErrorCallback) {
        onErrorCallback(error);
      }
    },
  });
};

export default useSubmitData;
