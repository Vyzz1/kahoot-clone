import { Response } from "express";

const errorHandler = (error: any, res: Response) => {
  if (error instanceof Error) {
    res.status(400).send({ message: error.message });
  } else {
    res.status(500).send({ message: "Internal server error" });
  }
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  if (typeof error === "string") {
    return error;
  }
  return "An error occurred";
}
export default errorHandler;
