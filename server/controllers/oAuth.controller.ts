import HttpStatusCode from "http-status-codes";
import { TypedRequest } from "../types/express";
import { Response } from "express";
import OAuthService from "../services/OAuth.service";

const { OK } = HttpStatusCode;
class OAuthController {
  private googleOauthService: OAuthService;
  constructor() {
    this.googleOauthService = new OAuthService("google");
    this.getGoogleLoginUrl = this.getGoogleLoginUrl.bind(this);
    this.handleGoogleCallback = this.handleGoogleCallback.bind(this);
  }

  async getGoogleLoginUrl(_req: TypedRequest, res: Response) {
    const url = await this.googleOauthService.getGoogleLoginUrl();
    res.status(OK).json({ url });
  }

  async handleGoogleCallback(
    req: TypedRequest<{ TBody: { code: string; state: string } }>,
    res: Response
  ) {
    const { code } = req.body;

    const { refreshToken, accessToken, user } =
      await this.googleOauthService.handleLoginCallBack(code);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });
    res.status(OK).json({
      ...user,
      accessToken,
    });
  }
}

export default new OAuthController();
