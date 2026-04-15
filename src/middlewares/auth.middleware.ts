import { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { syncClerkUser } from "../services/clerk-user.service";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid Clerk token" });
    }

    const user = await syncClerkUser(clerkUserId);
    req.userId = user.id;
    return next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    const message = error instanceof Error ? error.message : "Invalid token";
    return res.status(401).json({ error: message });
  }
}
