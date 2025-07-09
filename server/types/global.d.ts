declare interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}
declare namespace Express {
  interface Request {
    user?: AuthenticatedUser;
  }
}
interface CommonLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    email: string;
    role: string;
    fullName: string;
    avatar?: string | null;
  };
}
