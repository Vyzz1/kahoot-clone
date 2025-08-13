import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedExtensions = [
    ".jpg", ".jpeg", ".gif", ".png", ".avif", ".webp", ".svg",
    ".mp4", ".mov", ".avi", ".webm", ".mkv" 
  ];
  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only image files are allowed."));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize:
      (process.env.MAX_FILE_SIZE! as unknown as number) || 50 * 1024 * 1024,
  },
});
