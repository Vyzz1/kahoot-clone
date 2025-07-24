import { Router } from "express";
import validateSchema from "../middlewares/validate-schema";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import authController from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post(
  "/register",
  validateSchema(registerSchema),
  authController.register
);

authRouter.post("/login", validateSchema(loginSchema), authController.login);
    

authRouter.get("/refresh", authController.refreshToken);

export default authRouter;
