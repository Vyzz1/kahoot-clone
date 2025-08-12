import { BadRequestError } from "../error/customError";

export interface IOauthLoginStategy {
  generateAuthURL(): string;
  exchangeCodeForToken(code: string): Promise<string>;
  getUserInfo(token: string): Promise<any>;
}

export class OauthContext {
  constructor(private strategy: IOauthLoginStategy) {}

  async setStrategy(strategy: IOauthLoginStategy) {
    this.strategy = strategy;
  }

  async oAuthLogin(code: string) {
    const token = await this.strategy.exchangeCodeForToken(code);

    if (!token) {
      throw new BadRequestError();
    }

    console.info("Token received:", token);
    const userInfo = await this.strategy.getUserInfo(token);

    console.info("User info received:", userInfo);
    return userInfo;
  }
  async getLoginLink(): Promise<string> {
    return this.strategy.generateAuthURL();
  }
}

export class GoogleLoginStategy implements IOauthLoginStategy {
  constructor(
    private clientId: string,
    private clientSecret: string,
    private redirectUri: string
  ) {}

  generateAuthURL(): string {
    return (
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      "client_id=" +
      this.clientId +
      "&redirect_uri=" +
      encodeURIComponent(this.redirectUri) +
      "&scope=" +
      encodeURIComponent("openid email profile") +
      "&response_type=code" +
      "&access_type=offline" +
      "&prompt=consent"
    );
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    console.info("Exchanging code for token:", code);
    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: "authorization_code",
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();
    console.log(data);
    return data.access_token;
  }

  async getUserInfo(token: string): Promise<any> {
    const tokenUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
    const response = await fetch(tokenUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  }
}
