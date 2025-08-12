import { Router } from "express";
import oAuthController from "../controllers/oAuth.controller";

const oAuthRouter = Router();

oAuthRouter.get("/googleLogin", oAuthController.getGoogleLoginUrl);

oAuthRouter.post("/googleCallback", oAuthController.handleGoogleCallback);
export default oAuthRouter;
