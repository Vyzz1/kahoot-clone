import { GoogleLoginStategy, OauthContext } from "../patterns/OauthLogin";
import userService from "./user.service";
import authService from "./auth.service";

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

class OAuthService {
  private oauthContext: OauthContext;
  constructor(private type: "google" | "facebook") {
    this.oauthContext = new OauthContext(
      new GoogleLoginStategy(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        process.env.GOOGLE_REDIRECT_URI!
      )
    );
  }

  async getGoogleLoginUrl() {
    return this.oauthContext.getLoginLink();
  }

  async handleLoginCallBack(code: string): Promise<CommonLoginResponse> {
    const userInfo: GoogleUserInfo = await this.oauthContext.oAuthLogin(code);

    const { sub: googleId, email, name: fullName, picture: avatar } = userInfo;

    const user = await userService.findOrCreateOAuthUser(
      email,
      fullName,
      avatar,
      "google",
      googleId
    );

    return await authService.oAuthLogin(user);
  }
}

export default OAuthService;
