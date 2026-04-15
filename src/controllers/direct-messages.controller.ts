import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

export async function sendMessageController(req: Request, res: Response) {
  try {
    const senderId = req.userId;
    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ error: "Missing receiverId or content" });
    }

    const message = await prisma.directMessage.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { expoPushToken: true }
    });

    if (receiver?.expoPushToken && Expo.isExpoPushToken(receiver.expoPushToken)) {
      try {
        const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { username: true, email: true } });
        const senderName = sender?.username || sender?.email.split('@')[0] || "Someone";
        await expo.sendPushNotificationsAsync([{
          to: receiver.expoPushToken,
          sound: "default",
          title: `New message from ${senderName}`,
          body: content,
          data: { senderId }
        }]);
      } catch (err) {
        console.error("Failed to send push notification:", err);
      }
    }

    return res.json(message);
  } catch (error) {
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
