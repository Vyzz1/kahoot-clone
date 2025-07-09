import { StatusCodes } from "http-status-codes";

class CustomError extends Error {
  message: string;
  statusCode: number;
  name: string;
  constructor(message: string, statusCode: number, name: string) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.name = name || "CustomError";
    Error.captureStackTrace(this, this.constructor);
  }

  getJSON() {
    return {
      error: true,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

export class DocumentNotFoundError extends CustomError {
  constructor(message: string = "Document not found") {
    super(message, StatusCodes.NOT_FOUND, "DocumentNotFoundError");
  }
}

export class DuplicateDocumentError extends CustomError {
  constructor(message: string = "Duplicate document found") {
    super(message, StatusCodes.CONFLICT, "DuplicateDocumentError");
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = "Unauthorized access") {
    super(message, StatusCodes.UNAUTHORIZED, "UnauthorizedError");
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = "Forbidden access") {
    super(message, StatusCodes.FORBIDDEN, "ForbiddenError");
  }
}

export class InsufficientQuantityError extends CustomError {
  constructor(message: string = "Insufficient quantity available") {
    super(message, StatusCodes.BAD_REQUEST, "InsufficientQuantityError");
  }
}

export default CustomError;
