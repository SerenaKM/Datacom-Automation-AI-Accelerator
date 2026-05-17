import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";
import {
  isWithinEditWindow,
  EDIT_WINDOW_MINUTES,
  FLAG_THRESHOLD,
} from "../utils/constants";

const prisma = new PrismaClient();

export class KudosService {
  async createKudos(senderId: string, recipientId: string, message: string) {
    // Validation
    if (senderId === recipientId) {
      throw new AppError(400, "Cannot give kudos to yourself");
    }

    if (message.length > 280) {
      throw new AppError(400, "Message must be 280 characters or less");
    }

    if (message.trim().length === 0) {
      throw new AppError(400, "Message cannot be empty");
    }

    // Check recipient exists and is active
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient || !recipient.isActive) {
      throw new AppError(404, "Recipient not found or inactive");
    }

    // Check for duplicate submission (within 24 hours)
    const recentKudos = await prisma.kudos.findFirst({
      where: {
        senderId,
        recipientId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        isDeleted: false,
      },
    });

    if (recentKudos) {
      throw new AppError(
        400,
        "You already gave kudos to this person in the last 24 hours",
      );
    }

    // Create kudos (starts as pending)
    const kudos = await prisma.kudos.create({
      data: {
        senderId,
        recipientId,
        message,
        status: "PENDING",
        isVisible: false,
      },
      include: {
        sender: true,
        recipient: true,
      },
    });

    return kudos;
  }

  async getKudosFeed(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [kudos, total] = await Promise.all([
      prisma.kudos.findMany({
        where: {
          isVisible: true,
          status: "APPROVED",
          isDeleted: false,
          isArchived: false,
        },
        include: {
          sender: true,
          recipient: true,
          comments: {
            where: { isDeleted: false },
            take: 3,
            orderBy: { createdAt: "desc" },
          },
          reactions: true,
          flags: {
            where: { isArchived: false },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.kudos.count({
        where: {
          isVisible: true,
          status: "APPROVED",
          isDeleted: false,
          isArchived: false,
        },
      }),
    ]);

    return {
      data: kudos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserSentKudos(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [kudos, total] = await Promise.all([
      prisma.kudos.findMany({
        where: {
          senderId: userId,
          isDeleted: false,
        },
        include: {
          recipient: true,
          flags: true,
          comments: true,
          reactions: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.kudos.count({
        where: {
          senderId: userId,
          isDeleted: false,
        },
      }),
    ]);

    return {
      data: kudos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserReceivedKudos(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [kudos, total] = await Promise.all([
      prisma.kudos.findMany({
        where: {
          recipientId: userId,
          isDeleted: false,
        },
        include: {
          sender: true,
          flags: true,
          comments: true,
          reactions: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.kudos.count({
        where: {
          recipientId: userId,
          isDeleted: false,
        },
      }),
    ]);

    return {
      data: kudos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getKudosById(kudosId: string) {
    const kudos = await prisma.kudos.findUnique({
      where: { id: kudosId },
      include: {
        sender: true,
        recipient: true,
        comments: {
          where: { isDeleted: false },
          include: { author: true },
        },
        reactions: true,
        flags: true,
        moderator: true,
      },
    });

    if (!kudos) {
      throw new AppError(404, "Kudos not found");
    }

    return kudos;
  }

  async editKudos(kudosId: string, userId: string, newMessage: string) {
    const kudos = await this.getKudosById(kudosId);

    // Check sender
    if (kudos.senderId !== userId) {
      throw new AppError(403, "Cannot edit someone else's kudos");
    }

    // Check edit window
    if (!isWithinEditWindow(kudos.createdAt)) {
      throw new AppError(
        400,
        `Kudos can only be edited within ${EDIT_WINDOW_MINUTES} minutes of creation`,
      );
    }

    // Validate message
    if (newMessage.length > 280 || newMessage.trim().length === 0) {
      throw new AppError(400, "Message must be 1-280 characters");
    }

    // Track edit
    const editHistory = Array.isArray(kudos.editedBy) ? kudos.editedBy : [];
    editHistory.push({
      timestamp: new Date().toISOString(),
      message: kudos.message,
    });

    const updated = await prisma.kudos.update({
      where: { id: kudosId },
      data: {
        message: newMessage,
        editedBy: editHistory,
        updatedAt: new Date(),
      },
      include: {
        sender: true,
        recipient: true,
      },
    });

    return updated;
  }

  async retractKudos(kudosId: string, userId: string) {
    const kudos = await this.getKudosById(kudosId);

    // Check sender
    if (kudos.senderId !== userId) {
      throw new AppError(403, "Cannot retract someone else's kudos");
    }

    // Check retract window
    if (!isWithinEditWindow(kudos.createdAt)) {
      throw new AppError(
        400,
        `Kudos can only be retracted within ${EDIT_WINDOW_MINUTES} minutes of creation`,
      );
    }

    const retracted = await prisma.kudos.update({
      where: { id: kudosId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isVisible: false,
      },
    });

    return retracted;
  }
}

export default new KudosService();
