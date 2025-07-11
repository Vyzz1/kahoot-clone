import { Router } from "express";
import validateJWT from "../middlewares/validate-jwt";
import validateRole from "../middlewares/validate-role";
import validateSchema from "../middlewares/validate-schema";
import {
  banUserSchema,
  paginationUserSchema,
  userSchema,
} from "../schemas/user.schema";
import userController from "../controllers/user.controller";

const userRouter = Router();

const validateAdmin = [validateJWT, validateRole("user")];

userRouter.get(
  "/list",
  validateAdmin,
  validateSchema(paginationUserSchema, "query"),
  userController.getAllUsers
);

userRouter.post(
  "/",
  validateAdmin,
  validateSchema(userSchema, "body"),
  userController.addUser
);

userRouter.put(
  "/:id",
  validateAdmin,
  validateSchema(userSchema, "body"),
  userController.editUser
);

userRouter.patch(
  "/:id/ban",
  validateAdmin,
  validateSchema(banUserSchema),
  userController.banUser
);

userRouter.delete("/:id", validateAdmin, userController.deleteUser);

export default userRouter;
