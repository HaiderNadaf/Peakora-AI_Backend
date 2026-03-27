"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = chatController;
exports.chatHistoryController = chatHistoryController;
const prisma_1 = require("../config/prisma");
const chat_service_1 = require("../services/chat.service");
async function chatController(req, res) {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { message } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({ error: "message is required" });
        }
        const userMessage = message.trim();
        const reply = await (0, chat_service_1.generateChatReply)(userMessage);
        await prisma_1.prisma.message.createMany({
            data: [
                {
                    userId: req.userId,
                    role: "user",
                    content: userMessage,
                },
                {
                    userId: req.userId,
                    role: "assistant",
                    content: reply,
                },
            ],
        });
        return res.json({ reply });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
async function chatHistoryController(req, res) {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const messages = await prisma_1.prisma.message.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                role: true,
                content: true,
                createdAt: true,
            },
            take: 200,
        });
        return res.json({ messages });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
