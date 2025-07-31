import { Request, Response } from "express";
import uploadService from "../services/upload.service";
import { StatusCodes } from "http-status-codes";
const { CREATED } = StatusCodes;

class UploadController {
  async uploadSinlgeFile(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).send({ message: "No file uploaded" });
    }

    const result = await uploadService.uploadFile(req.file!);

    res.status(CREATED).send(result);
  }

  async uploadMultipleFiles(req: Request, res: Response) {
    if (!req.files || req.files.length === 0) {
      res.status(400).send({ message: "No files uploaded" });
    }

    const results = await uploadService.uploadFiles(
      req.files as Express.Multer.File[]
    );

    res.status(CREATED).send(results);
  }
}

export const uploadController = new UploadController();
export default uploadController;
