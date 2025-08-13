import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/express";
import redis from "../redis";

const validateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    async (err, decoded: any) => {
      if (err) {
        console.error("JWT verification error:", err);
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const blackListKey = `TOKEN_BLACK_LIST_${decoded.userId}_${decoded.jti}`;

      const isBlackListed = await redis.get(blackListKey);

      if (isBlackListed) {
        console.warn("Token is blacklisted:", blackListKey);
        res.status(401).json({ message: "Token is revoked" });
        return;
      }

      const iatKey = `TOKEN_IAT_AVAILABLE_${decoded.userId}`;

      const changePasswordTimestamp = await redis.get(iatKey);

      console.info("IAT FROM JWT ", decoded.iat);
      console.info("Change Password Timestamp ", changePasswordTimestamp);

      if (
        changePasswordTimestamp &&
        decoded.iat < parseInt(changePasswordTimestamp.toString())
      ) {
        res.status(401).json({ message: "Token is revoked. Login required" });
        return;
      }

      req.user = decoded;
      next();
    }
  );
};

export default validateJWT;
