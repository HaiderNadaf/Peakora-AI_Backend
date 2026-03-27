"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const auth_service_1 = require("../services/auth.service");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.slice("Bearer ".length);
    try {
        const payload = (0, auth_service_1.verifyToken)(token);
        req.userId = payload.userId;
        return next();
    }
    catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
