import { Router } from "express";
import { AuthRequest } from "../middleware/auth";
import KudosService from "../services/KudosService";

const router = Router();

// POST /api/kudos - Create new kudos
router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      return res
        .status(400)
        .json({ error: "recipientId and message are required" });
    }

    const kudos = await KudosService.createKudos(
      req.user!.id,
      recipientId,
      message,
    );
    res.status(201).json(kudos);
  } catch (error) {
    next(error);
  }
});

// GET /api/kudos/feed - Public feed
router.get("/feed", async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const feed = await KudosService.getKudosFeed(page, limit);
    res.json(feed);
  } catch (error) {
    next(error);
  }
});

// GET /api/kudos/sent - User's sent kudos
router.get("/sent", async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const sent = await KudosService.getUserSentKudos(req.user!.id, page, limit);
    res.json(sent);
  } catch (error) {
    next(error);
  }
});

// GET /api/kudos/received - User's received kudos
router.get("/received", async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const received = await KudosService.getUserReceivedKudos(
      req.user!.id,
      page,
      limit,
    );
    res.json(received);
  } catch (error) {
    next(error);
  }
});

// GET /api/kudos/:id - Get single kudos
router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const kudos = await KudosService.getKudosById(req.params.id);
    res.json(kudos);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/kudos/:id - Edit kudos
router.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const updated = await KudosService.editKudos(
      req.params.id,
      req.user!.id,
      message,
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/kudos/:id - Retract kudos
router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const retracted = await KudosService.retractKudos(
      req.params.id,
      req.user!.id,
    );
    res.json({ message: "Kudos retracted successfully", data: retracted });
  } catch (error) {
    next(error);
  }
});

export default router;
