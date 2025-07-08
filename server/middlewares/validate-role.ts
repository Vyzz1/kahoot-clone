import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/express";

const validateRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    console.log("User role:", userRole);
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
};

export default validateRole;
