import { NextFunction, Request, Response } from "express";
import { verifyToken } from "@clerk/backend";
import { clerkSecretKey } from "../config/clerk";
import { syncClerkUser } from "../services/clerk-user.service";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  try {
    if (!clerkSecretKey) {
      return res.status(500).json({ error: "Missing Clerk secret key" });
    }

    const token = authHeader.slice("Bearer ".length);
    const payload = await verifyToken(token, { secretKey: clerkSecretKey });
    const clerkUserId = payload.sub;

    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await syncClerkUser(clerkUserId);
    req.userId = user.id;
    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid token";
    return res.status(401).json({ error: message });
  }
}
