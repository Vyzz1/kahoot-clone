import { Response } from "express";
import { RegisterRequest } from "../schemas/auth.schema";
import authService from "../services/auth.service";
import { TypedRequest } from "../types/express";
import { StatusCodes } from "http-status-codes";
const { CREATED, OK } = StatusCodes;
class AuthController {
  async register(req: TypedRequest<{ TBody: RegisterRequest }>, res: Response) {
    const response = await authService.register(req.body);

    res.cookie("refreshToken", response.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(CREATED).send({
      ...response.user,
      accessToken: response.accessToken,
    });
  }

  async login(req: TypedRequest<{ TBody: RegisterRequest }>, res: Response) {
    const response = await authService.login(req.body);

    res.cookie("refreshToken", response.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(OK).send({
      ...response.user,
      accessToken: response.accessToken,
    });
  }

  async refreshToken(req: TypedRequest, res: Response) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(StatusCodes.UNAUTHORIZED).send({
        message: "No refresh token provided",
      });
    }

    const accessToken = await authService.refreshToken(refreshToken);

    res.status(OK).send({
      accessToken,
    });
  }
}

export default new AuthController();
