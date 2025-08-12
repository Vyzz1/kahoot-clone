import { Router } from "express";
import validateSchema from "../middlewares/validate-schema";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "../schemas/auth.schema";
import authController from "../controllers/auth.controller";
import validateJWT from "../middlewares/validate-jwt";

const authRouter = Router();

authRouter.post(
  "/register",
  validateSchema(registerSchema),
  authController.register
);

authRouter.post("/login", validateSchema(loginSchema), authController.login);

authRouter.get("/refresh", authController.refreshToken);
authRouter.get("/logout", validateJWT, authController.logout);
authRouter.post(
  "/change-password",
  validateJWT,
  validateSchema(changePasswordSchema),
  authController.changePassword
);
export default authRouter;
