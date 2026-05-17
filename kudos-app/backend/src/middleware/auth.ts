import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret) as {
      id: string;
      username: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // This would check against a roles/permissions table
  // For now, we'll assume this is handled by the dashboard system
  const isAdmin = req.headers["x-admin-role"] === "true"; // Temporary solution

  if (!isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};
