import { Router } from "express";
import uploadController from "../controllers/upload.controller";
import validateJWT from "../middlewares/validate-jwt";
import { upload } from "../utils/multer";

const uploadRoute = Router();

uploadRoute.use(validateJWT);

uploadRoute.post("/", upload.single("file"), uploadController.uploadSinlgeFile);

uploadRoute.post(
  "/multiple",
  upload.array("files", 10),
  uploadController.uploadMultipleFiles
);

export default uploadRoute;
