import { NextFunction, Request, Response } from "express";
import CustomError from "../error/customError";
import { StatusCodes } from "http-status-codes";
import { getErrorMessage } from "../utils/error";

export default function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    next(error);
  }

  if (error instanceof CustomError) {
    res.status(error.statusCode).send(error.getJSON());
  } else
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message:
          getErrorMessage(error) ||
          "An error occurred. Please view logs for more details",
      },
    });
}
