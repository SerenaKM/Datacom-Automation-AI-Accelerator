import { Router } from "express";
import { AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { isWithinEditWindow, EDIT_WINDOW_MINUTES } from "../utils/constants";
import { AppError } from "../middleware/errorHandler";

const router = Router();
const prisma = new PrismaClient();

// POST /api/comments - Add comment to kudos
router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const { kudosId, commentText } = req.body;

    if (!kudosId || !commentText) {
      return res
        .status(400)
        .json({ error: "kudosId and commentText are required" });
    }

    if (commentText.length > 150) {
      throw new AppError(400, "Comment must be 150 characters or less");
    }

    // Verify kudos exists and is approved
    const kudos = await prisma.kudos.findUnique({ where: { id: kudosId } });
    if (!kudos || !kudos.isVisible) {
      throw new AppError(404, "Kudos not found or not visible");
    }

    const comment = await prisma.kudosComment.create({
      data: {
        kudosId,
        userId: req.user!.id,
        commentText,
      },
      include: { author: true },
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

// GET /api/comments/:kudosId - Get comments for kudos
router.get("/:kudosId", async (req: AuthRequest, res, next) => {
  try {
    const { kudosId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.kudosComment.findMany({
        where: {
          kudosId,
          isDeleted: false,
        },
        include: { author: true },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.kudosComment.count({
        where: {
          kudosId,
          isDeleted: false,
        },
      }),
    ]);

    res.json({
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/comments/:id - Edit comment
router.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const { commentText } = req.body;

    if (!commentText) {
      return res.status(400).json({ error: "commentText is required" });
    }

    if (commentText.length > 150) {
      throw new AppError(400, "Comment must be 150 characters or less");
    }

    const comment = await prisma.kudosComment.findUnique({
      where: { id: req.params.id },
    });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    if (comment.userId !== req.user!.id) {
      throw new AppError(403, "Cannot edit someone else's comment");
    }

    if (!isWithinEditWindow(comment.createdAt)) {
      throw new AppError(
        400,
        `Comments can only be edited within ${EDIT_WINDOW_MINUTES} minutes`,
      );
    }

    // Track edit
    const editHistory = Array.isArray(comment.editedBy) ? comment.editedBy : [];
    editHistory.push({
      timestamp: new Date().toISOString(),
      text: comment.commentText,
    });

    const updated = await prisma.kudosComment.update({
      where: { id: req.params.id },
      data: {
        commentText,
        editedBy: editHistory,
        updatedAt: new Date(),
      },
      include: { author: true },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/comments/:id - Delete comment (anytime)
router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const comment = await prisma.kudosComment.findUnique({
      where: { id: req.params.id },
    });

    if (!comment) {
      throw new AppError(404, "Comment not found");
    }

    if (comment.userId !== req.user!.id) {
      throw new AppError(403, "Cannot delete someone else's comment");
    }

    const deleted = await prisma.kudosComment.update({
      where: { id: req.params.id },
      data: { isDeleted: true },
    });

    res.json({ message: "Comment deleted", data: deleted });
  } catch (error) {
    next(error);
  }
});

// POST /api/comments/:id/flag - Flag a comment
router.post("/:id/flag", async (req: AuthRequest, res, next) => {
  try {
    const { flagReason, comment } = req.body;

    if (!flagReason) {
      return res.status(400).json({ error: "flagReason is required" });
    }

    const kudosComment = await prisma.kudosComment.findUnique({
      where: { id: req.params.id },
    });

    if (!kudosComment) {
      throw new AppError(404, "Comment not found");
    }

    // Create flag
    const flag = await prisma.kudosCommentFlag.create({
      data: {
        commentId: req.params.id,
        flaggedBy: req.user!.id,
        flagReason,
        comment: comment || null,
      },
    });

    // Check if threshold reached (3 flags)
    const flagCount = await prisma.kudosCommentFlag.count({
      where: { commentId: req.params.id },
    });

    if (flagCount >= 3) {
      await prisma.kudosComment.update({
        where: { id: req.params.id },
        data: {
          isFlagged: true,
          flaggedAt: new Date(),
          flagCount,
        },
      });
    }

    res.status(201).json(flag);
  } catch (error) {
    next(error);
  }
});

export default router;
