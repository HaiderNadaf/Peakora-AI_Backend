import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function sendMessageController(req: Request, res: Response) {
  try {
    const senderId = req.userId;
    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { receiverId, content } = req.body;
    if (typeof receiverId !== "string" || typeof content !== "string") {
      return res.status(400).json({ error: "Missing receiverId or content" });
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return res.status(400).json({ error: "Message content cannot be empty" });
    }

    const [senderExists, receiverExists] = await Promise.all([
      prisma.user.findUnique({
        where: { id: senderId },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true },
      }),
    ]);

    if (!senderExists) {
      return res.status(404).json({
        error: "Sender user not found. Please sign out and sign in again.",
      });
    }
    if (!receiverExists) {
      return res.status(404).json({ error: "Receiver user not found" });
    }

    const message = await prisma.directMessage.create({
      data: {
        senderId,
        receiverId,
        content: trimmedContent,
      },
    });

    return res.json(message);
  } catch (error) {
    console.error("sendMessageController error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      code: typeof error === "object" && error && "code" in error ? (error as { code?: string }).code : undefined,
      meta: typeof error === "object" && error && "meta" in error ? (error as { meta?: unknown }).meta : undefined,
    });
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

export async function getConversationsController(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get all distinct users I have messaged or received messages from
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { sentDirectMessages: { some: { receiverId: userId } } },
          { receivedDirectMessages: { some: { senderId: userId } } }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
      }
    });
    
    // For each user, get the last message
    const conversations = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await prisma.directMessage.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: user.id },
              { senderId: user.id, receiverId: userId }
            ]
          },
          orderBy: { createdAt: 'desc' }
        });
        
        return {
          user,
          lastMessage
        };
      })
    );

    // Sort by last message date descending
    conversations.sort((a, b) => {
      if (!a.lastMessage || !b.lastMessage) return 0;
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
    });

    return res.json(conversations);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

export async function getMessagesWithUserController(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { otherUserId } = req.params;

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.json(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
