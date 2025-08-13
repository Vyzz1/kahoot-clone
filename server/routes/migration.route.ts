import { Router } from "express";
import validateJWT from "../middlewares/validate-jwt";
import validateRole from "../middlewares/validate-role";
import migrationController from "../controllers/migration.controller";

const migrationRouter = Router();

migrationRouter.post(
  "/seed-data",
  validateJWT,
  validateRole("admin"),
  migrationController.seedSampleData
);

migrationRouter.get(
  "/status",
  validateJWT,
  validateRole("admin"),
  migrationController.getMigrationStatus
);

migrationRouter.post(
  "/run-migrations",
  validateJWT,
  validateRole("admin"),
  migrationController.runSchemaMigrations
);

export default migrationRouter;
