import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getUsersController(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: userId, // don't return the current user
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
      orderBy: {
        username: 'asc'
      }
    });

    return res.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

export async function updatePushTokenController(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { expoPushToken } = req.body;
    if (typeof expoPushToken !== "string") {
      return res.status(400).json({ error: "Invalid token" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { expoPushToken },
    });

    return res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
