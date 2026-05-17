import { Router } from "express";
import { AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import {
  FLAG_REASONS,
  FLAG_COOLDOWN_MINUTES,
  FLAG_THRESHOLD,
  isWithinFlagCooldown,
  calculateCooldownRemaining,
} from "../utils/constants";
import { AppError } from "../middleware/errorHandler";

const router = Router();
const prisma = new PrismaClient();

// POST /api/flags - Flag a kudos
router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const { kudosId, flagReason, comment } = req.body;

    if (!kudosId || !flagReason) {
      return res
        .status(400)
        .json({ error: "kudosId and flagReason are required" });
    }

    if (!FLAG_REASONS.includes(flagReason)) {
      throw new AppError(
        400,
        `Invalid flag reason. Valid reasons: ${FLAG_REASONS.join(", ")}`,
      );
    }

    // Verify kudos exists
    const kudos = await prisma.kudos.findUnique({ where: { id: kudosId } });
    if (!kudos) {
      throw new AppError(404, "Kudos not found");
    }

    // Check cooldown
    const lastFlag = await prisma.kudosFlag.findFirst({
      where: {
        flaggedBy: req.user!.id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (lastFlag && isWithinFlagCooldown(lastFlag.createdAt)) {
      const remaining = calculateCooldownRemaining(lastFlag.createdAt);
      throw new AppError(
        429,
        `Please wait ${remaining} minutes before flagging another kudos`,
      );
    }

    // Check if already flagged by this user
    const existingFlag = await prisma.kudosFlag.findUnique({
      where: {
        kudosId_flaggedBy: {
          kudosId,
          flaggedBy: req.user!.id,
        },
      },
    });

    if (existingFlag) {
      throw new AppError(400, "You have already flagged this kudos");
    }

    // Create flag
    const flag = await prisma.kudosFlag.create({
      data: {
        kudosId,
        flaggedBy: req.user!.id,
        flagReason,
        comment: comment || null,
      },
    });

    // Increment flag count
    const flagCount = await prisma.kudosFlag.count({
      where: {
        kudosId,
        isArchived: false,
      },
    });

    // Check if threshold reached
    if (flagCount >= FLAG_THRESHOLD) {
      await prisma.kudos.update({
        where: { id: kudosId },
        data: {
          flagCount,
          isVisible: false, // Hide from public feed
        },
      });
    } else {
      await prisma.kudos.update({
        where: { id: kudosId },
        data: { flagCount },
      });
    }

    res.status(201).json(flag);
  } catch (error) {
    next(error);
  }
});

// GET /api/flags/:kudosId - Get flags for kudos
router.get("/:kudosId", async (req: AuthRequest, res, next) => {
  try {
    const flags = await prisma.kudosFlag.findMany({
      where: { kudosId: req.params.kudosId },
      include: { flaggedByUser: true },
      orderBy: { createdAt: "desc" },
    });

    // Group by reason
    const summary: any = {};
    flags.forEach((flag) => {
      if (!summary[flag.flagReason]) {
        summary[flag.flagReason] = 0;
      }
      summary[flag.flagReason]++;
    });

    res.json({
      total: flags.length,
      summary,
      flags,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
