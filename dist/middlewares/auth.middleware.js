"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const backend_1 = require("@clerk/backend");
const clerk_1 = require("../config/clerk");
const clerk_user_service_1 = require("../services/clerk-user.service");
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  try {
    if (!clerk_1.clerkSecretKey) {
      return res.status(500).json({ error: "Missing Clerk secret key" });
    }
    const token = authHeader.slice("Bearer ".length);
    const payload = await (0, backend_1.verifyToken)(token, {
      secretKey: clerk_1.clerkSecretKey,
    });
    const clerkUserId = payload.sub;
    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await (0, clerk_user_service_1.syncClerkUser)(clerkUserId);
    req.userId = user.id;
    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid token";
    return res.status(401).json({ error: message });
  }
}
