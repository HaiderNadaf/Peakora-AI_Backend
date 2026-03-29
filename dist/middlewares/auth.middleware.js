"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const express_1 = require("@clerk/express");
const clerk_user_service_1 = require("../services/clerk-user.service");
async function authMiddleware(req, res, next) {
    const { userId } = (0, express_1.getAuth)(req);
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const user = await (0, clerk_user_service_1.syncClerkUser)(userId);
        req.userId = user.id;
        return next();
    }
    catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
