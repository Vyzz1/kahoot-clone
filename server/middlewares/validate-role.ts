  import { NextFunction, Response } from "express";
  import { AuthenticatedRequest } from "../types/express";

  const validateRole = (...allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userRole = req.user?.role;
      console.log("User role:", userRole);
      console.log("Allowed roles:", allowedRoles);
      if (!userRole || !allowedRoles.includes(userRole)) {
        res.status(401).json({ message: "Unauthorized" });
        return; // Thêm return để ngăn chặn việc tiếp tục xử lý
      }
      next();
    };
  };

  export default validateRole;
