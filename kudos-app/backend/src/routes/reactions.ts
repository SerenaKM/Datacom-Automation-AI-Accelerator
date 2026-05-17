import { Router } from "express";
import { AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { ALLOWED_EMOJIS } from "../utils/constants";
import { AppError } from "../middleware/errorHandler";

const router = Router();
const prisma = new PrismaClient();

// POST /api/reactions - Add reaction to kudos
router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const { kudosId, emoji } = req.body;

    if (!kudosId || !emoji) {
      return res.status(400).json({ error: "kudosId and emoji are required" });
    }

    // Validate emoji
    if (!ALLOWED_EMOJIS.includes(emoji)) {
      throw new AppError(
        400,
        `Invalid emoji. Allowed emojis: ${ALLOWED_EMOJIS.join(", ")}`,
      );
    }

    // Verify kudos exists and is visible
    const kudos = await prisma.kudos.findUnique({ where: { id: kudosId } });
    if (!kudos || !kudos.isVisible) {
      throw new AppError(404, "Kudos not found or not visible");
    }

    // Check if user already has a reaction on this kudos
    const existingReaction = await prisma.kudosReaction.findUnique({
      where: {
        kudosId_userId: {
          kudosId,
          userId: req.user!.id,
        },
      },
    });

    let reaction;
    if (existingReaction) {
      // Update existing reaction
      reaction = await prisma.kudosReaction.update({
        where: { id: existingReaction.id },
        data: { emoji },
      });
    } else {
      // Create new reaction
      reaction = await prisma.kudosReaction.create({
        data: {
          kudosId,
          userId: req.user!.id,
          emoji,
        },
      });
    }

    res.status(201).json(reaction);
  } catch (error) {
    next(error);
  }
});

// GET /api/reactions/:kudosId - Get all reactions for kudos
router.get("/:kudosId", async (req: AuthRequest, res, next) => {
  try {
    const reactions = await prisma.kudosReaction.findMany({
      where: { kudosId: req.params.kudosId },
      include: { user: true },
    });

    // Group by emoji and count
    const summary = ALLOWED_EMOJIS.map((emoji) => ({
      emoji,
      count: reactions.filter((r) => r.emoji === emoji).length,
      users: reactions
        .filter((r) => r.emoji === emoji)
        .map((r) => ({
          id: r.user.id,
          username: r.user.username,
        })),
    })).filter((item) => item.count > 0);

    res.json({
      total: reactions.length,
      reactions: summary,
      allReactions: reactions,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reactions/:kudosId/:emoji - Remove reaction
router.delete("/:kudosId/:emoji", async (req: AuthRequest, res, next) => {
  try {
    const reaction = await prisma.kudosReaction.findUnique({
      where: {
        kudosId_userId: {
          kudosId: req.params.kudosId,
          userId: req.user!.id,
        },
      },
    });

    if (!reaction) {
      throw new AppError(404, "Reaction not found");
    }

    await prisma.kudosReaction.delete({
      where: { id: reaction.id },
    });

    res.json({ message: "Reaction removed" });
  } catch (error) {
    next(error);
  }
});

export default router;
