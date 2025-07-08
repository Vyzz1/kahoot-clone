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
