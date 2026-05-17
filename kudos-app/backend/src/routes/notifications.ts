import { Router } from "express";
import { AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const router = Router();
const prisma = new PrismaClient();

// GET /api/notifications/preferences - Get user notification preferences
router.get("/preferences", async (req: AuthRequest, res, next) => {
  try {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId: req.user!.id },
    });

    // Create default preferences if doesn't exist
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId: req.user!.id,
          notifyOnKudos: false,
          notifyOnComments: false,
          notifyOnReactions: false,
        },
      });
    }

    res.json(prefs);
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/preferences - Update notification preferences
router.post("/preferences", async (req: AuthRequest, res, next) => {
  try {
    const { notifyOnKudos, notifyOnComments, notifyOnReactions } = req.body;

    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId: req.user!.id },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId: req.user!.id,
          notifyOnKudos: notifyOnKudos || false,
          notifyOnComments: notifyOnComments || false,
          notifyOnReactions: notifyOnReactions || false,
        },
      });
    } else {
      prefs = await prisma.notificationPreference.update({
        where: { userId: req.user!.id },
        data: {
          ...(notifyOnKudos !== undefined && { notifyOnKudos }),
          ...(notifyOnComments !== undefined && { notifyOnComments }),
          ...(notifyOnReactions !== undefined && { notifyOnReactions }),
        },
      });
    }

    res.json(prefs);
  } catch (error) {
    next(error);
  }
});

export default router;
