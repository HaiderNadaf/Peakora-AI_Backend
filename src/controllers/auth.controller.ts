import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function signupController(req: Request, res: Response) {
  return res
    .status(410)
    .json({ error: "Signup is handled by Clerk in the mobile app." });
}

export async function loginController(req: Request, res: Response) {
  return res
    .status(410)
    .json({ error: "Login is handled by Clerk in the mobile app." });
}

export async function meController(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
