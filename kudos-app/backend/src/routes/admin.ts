import { Router } from "express";
import { AuthRequest, authorizeAdmin } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/kudos/pending - Get pending kudos for moderation
router.get(
  "/kudos/pending",
  authorizeAdmin,
  async (req: AuthRequest, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [kudos, total] = await Promise.all([
        prisma.kudos.findMany({
          where: { status: "PENDING" },
          include: {
            sender: true,
            recipient: true,
            flags: true,
          },
          orderBy: { createdAt: "asc" },
          skip,
          take: limit,
        }),
        prisma.kudos.count({ where: { status: "PENDING" } }),
      ]);

      res.json({
        data: kudos,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/admin/kudos/flagged - Get flagged kudos
router.get(
  "/kudos/flagged",
  authorizeAdmin,
  async (req: AuthRequest, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [kudos, total] = await Promise.all([
        prisma.kudos.findMany({
          where: { flagCount: { gte: 3 } },
          include: {
            sender: true,
            recipient: true,
            flags: { include: { flaggedByUser: true } },
          },
          orderBy: { flagCount: "desc" },
          skip,
          take: limit,
        }),
        prisma.kudos.count({ where: { flagCount: { gte: 3 } } }),
      ]);

      res.json({
        data: kudos,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/admin/kudos/:id/approve - Approve kudos
router.patch(
  "/kudos/:id/approve",
  authorizeAdmin,
  async (req: AuthRequest, res, next) => {
    try {
      const kudos = await prisma.kudos.update({
        where: { id: req.params.id },
        data: {
          status: "APPROVED",
          isVisible: true,
          moderatedBy: req.user!.id,
          moderatedAt: new Date(),
        },
        include: { sender: true, recipient: true },
      });

      res.json({ message: "Kudos approved", data: kudos });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/admin/kudos/:id/reject - Reject kudos
router.patch(
  "/kudos/:id/reject",
  authorizeAdmin,
  async (req: AuthRequest, res, next) => {
    try {
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: "reason is required" });
      }

      const kudos = await prisma.kudos.update({
        where: { id: req.params.id },
        data: {
          status: "REJECTED",
          isVisible: false,
          moderatedBy: req.user!.id,
          moderatedAt: new Date(),
          moderationReason: reason,
        },
        include: { sender: true, recipient: true },
      });

      res.json({ message: "Kudos rejected", data: kudos });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/admin/kudos/:id/clear-flags - Clear flags on kudos
router.patch(
  "/kudos/:id/clear-flags",
  authorizeAdmin,
  async (req: AuthRequest, res, next) => {
    try {
      // Mark all flags as resolved
      await prisma.kudosFlag.updateMany({
        where: { kudosId: req.params.id },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy: req.user!.id,
        },
      });

      const kudos = await prisma.kudos.update({
        where: { id: req.params.id },
        data: { flagCount: 0 },
        include: { flags: true },
      });

      res.json({ message: "Flags cleared", data: kudos });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/admin/comments/flagged - Get flagged comments
router.get(
  "/comments/flagged",
  authorizeAdmin,
  async (req: AuthRequest, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        prisma.kudosComment.findMany({
          where: { isFlagged: true },
          include: {
            author: true,
            kudos: true,
            flags: true,
          },
          orderBy: { flagCount: "desc" },
          skip,
          take: limit,
        }),
        prisma.kudosComment.count({ where: { isFlagged: true } }),
      ]);

      res.json({
        data: comments,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/admin/comments/:id/hide - Hide flagged comment
router.patch(
  "/comments/:id/hide",
  authorizeAdmin,
  async (req: AuthRequest, res, next) => {
    try {
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: "reason is required" });
      }

      const comment = await prisma.kudosComment.update({
        where: { id: req.params.id },
        data: { isDeleted: true },
      });

      res.json({ message: "Comment hidden", data: comment });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
