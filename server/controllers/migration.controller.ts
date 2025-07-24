// src/controllers/migration.controller.ts
import { Request, Response } from "express";
import migrationService from "../services/migration.service";
import { StatusCodes } from "http-status-codes";

const { OK, INTERNAL_SERVER_ERROR } = StatusCodes;

class MigrationController {
  /**
   * @route POST /api/migrate/seed-data
   * @description Tạo dữ liệu mẫu cho người dùng, quiz và câu hỏi.
   * @access Admin
   */
  async seedSampleData(req: Request, res: Response): Promise<void> {
    try {
      await migrationService.seedSampleData();
      res.status(OK).send({ message: "Sample data seeded successfully!" });
    } catch (error) {
      console.error("Error seeding sample data:", error);
      res.status(INTERNAL_SERVER_ERROR).send({
        message: "Failed to seed sample data.",
        error: (error as Error).message,
      });
    }
  }

  /**
   * @route GET /api/migrate/status
   * @description Lấy trạng thái migration hiện tại của database và danh sách các migration đã định nghĩa.
   * @access Admin
   */
  async getMigrationStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await migrationService.getMigrationStatus();
      res.status(OK).send(status);
    } catch (error) {
      console.error("Error getting migration status:", error);
      res.status(INTERNAL_SERVER_ERROR).send({
        message: "Failed to retrieve migration status.",
        error: (error as Error).message,
      });
    }
  }

  /**
   * @route POST /api/migrate/run-migrations
   * @description Chạy các migration schema để cập nhật cấu trúc dữ liệu.
   * @access Admin
   */
  async runSchemaMigrations(req: Request, res: Response): Promise<void> {
    try {
      const result = await migrationService.runSchemaMigrations(); // ✅ Lấy kết quả chi tiết
      res.status(OK).send(result); // ✅ Trả về kết quả chi tiết
    } catch (error) {
      console.error("Error running schema migrations:", error);
      res.status(INTERNAL_SERVER_ERROR).send({
        message: "Failed to run schema migrations.",
        error: (error as Error).message,
      });
    }
  }
}

export default new MigrationController();
