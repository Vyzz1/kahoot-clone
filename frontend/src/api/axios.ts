import axios from "axios";

export const baseURL = `http://localhost:8000/api`;

export default axios.create({
  baseURL: baseURL,
  headers: {
    "Content-type": "application/json",
  },
  withCredentials: true,
});
export const axiosUpload = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "multipart/form-data" },
  withCredentials: true,
});
