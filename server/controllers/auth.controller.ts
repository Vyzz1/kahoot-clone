import { Response } from "express";
import { ChangePasswordRequest, RegisterRequest } from "../schemas/auth.schema";
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
  async logout(req: TypedRequest, res: Response) {
    await authService.logout(req.user);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(OK).send({
      message: "Logged out successfully",
    });
  }

  async changePassword(
    req: TypedRequest<{ TBody: ChangePasswordRequest }>,
    res: Response
  ) {
    const response = await authService.changePassword(
      req.body,
      req.user,
      req.cookies.refreshToken
    );

    res.status(OK).send(response);
  }
}

export default new AuthController();
