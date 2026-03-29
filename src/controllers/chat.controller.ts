import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { generateChatReply } from "../services/chat.service";
import { getOrCreateGuestUserId } from "../services/auth.service";

export async function chatController(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { message } = req.body as { message?: string };

    if (!message?.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const userMessage = message.trim();
    const reply = await generateChatReply(userMessage);

    await prisma.message.createMany({
      data: [
        {
          userId,
          role: "user",
          content: userMessage,
        },
        {
          userId,
          role: "assistant",
          content: reply,
        },
      ],
    });

    return res.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

export async function chatHistoryController(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const messages = await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
      take: 200,
    });

    return res.json({ messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
