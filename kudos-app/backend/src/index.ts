import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Import routes
import kudosRoutes from "./routes/kudos";
import commentsRoutes from "./routes/comments";
import reactionsRoutes from "./routes/reactions";
import flagsRoutes from "./routes/flags";
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/users";
import notificationRoutes from "./routes/notifications";

// Import middleware
import { authenticateToken } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/kudos", authenticateToken, kudosRoutes);
app.use("/api/comments", authenticateToken, commentsRoutes);
app.use("/api/reactions", authenticateToken, reactionsRoutes);
app.use("/api/flags", authenticateToken, flagsRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/notifications", authenticateToken, notificationRoutes);
app.use("/api/admin", authenticateToken, adminRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✓ Database connected");

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
