import { Router } from "express";
import { AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const router = Router();
const prisma = new PrismaClient();

// GET /api/users/list - Get list of active users
router.get("/list", async (req: AuthRequest, res, next) => {
  try {
    const search = (req.query.search as string) || "";
    const limit = parseInt(req.query.limit as string) || 20;

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        id: {
          not: req.user!.id, // Exclude current user
        },
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
      },
      take: limit,
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/profile - Get current user profile
router.get("/profile", async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
