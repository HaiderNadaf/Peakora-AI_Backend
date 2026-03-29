"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupController = signupController;
exports.loginController = loginController;
exports.meController = meController;
const prisma_1 = require("../config/prisma");
async function signupController(req, res) {
    return res.status(410).json({ error: "Signup is handled by Clerk in the mobile app." });
}
async function loginController(req, res) {
    return res.status(410).json({ error: "Login is handled by Clerk in the mobile app." });
}
async function meController(req, res) {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, createdAt: true },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(user);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
