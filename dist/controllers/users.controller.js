"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePushTokenController = exports.getUsersController = void 0;
const prisma_1 = require("../config/prisma");
async function getUsersController(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const users = await prisma_1.prisma.user.findMany({
            where: {
                id: { not: userId },
            },
            select: {
                id: true,
                email: true,
                username: true,
            },
            orderBy: {
                username: "asc",
            },
        });
        return res.json(users);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
exports.getUsersController = getUsersController;
async function updatePushTokenController(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { expoPushToken } = req.body;
        if (typeof expoPushToken !== "string") {
            return res.status(400).json({ error: "Invalid token" });
        }
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { expoPushToken },
        });
        return res.json({ success: true });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
exports.updatePushTokenController = updatePushTokenController;
