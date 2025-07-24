// src/routes/migration.route.ts
import { Router } from "express";
import validateJWT from "../middlewares/validate-jwt";
import validateRole from "../middlewares/validate-role";
import migrationController from "../controllers/migration.controller";

const migrationRouter = Router();

// Tuyến đường để tạo dữ liệu mẫu
// Chỉ admin mới có quyền truy cập
migrationRouter.post(
  "/seed-data",
  validateJWT,
  validateRole("admin"),
  migrationController.seedSampleData
);

// ✅ Tuyến đường mới để lấy trạng thái migration
migrationRouter.get(
  "/status",
  validateJWT,
  validateRole("admin"), // Chỉ admin mới có quyền xem trạng thái
  migrationController.getMigrationStatus
);

// Tuyến đường để chạy các migration schema
// Chỉ admin mới có quyền truy cập
migrationRouter.post(
  "/run-migrations",
  validateJWT,
  validateRole("admin"),
  migrationController.runSchemaMigrations
);

export default migrationRouter;
