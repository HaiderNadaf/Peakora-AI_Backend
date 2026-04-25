"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesWithUserController = exports.getConversationsController = exports.sendMessageController = void 0;
const prisma_1 = require("../config/prisma");
async function sendMessageController(req, res) {
    try {
        const senderId = req.userId;
        if (!senderId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { receiverId, content } = req.body;
        if (typeof receiverId !== "string" || typeof content !== "string") {
            return res.status(400).json({ error: "Missing receiverId or content" });
        }
        const trimmedContent = content.trim();
        if (!trimmedContent) {
            return res.status(400).json({ error: "Message content cannot be empty" });
        }
        const [senderExists, receiverExists] = await Promise.all([
            prisma_1.prisma.user.findUnique({
                where: { id: senderId },
                select: { id: true },
            }),
            prisma_1.prisma.user.findUnique({
                where: { id: receiverId },
                select: { id: true },
            }),
        ]);
        if (!senderExists) {
            return res.status(404).json({
                error: "Sender user not found. Please sign out and sign in again.",
            });
        }
        if (!receiverExists) {
            return res.status(404).json({ error: "Receiver user not found" });
        }
        const message = await prisma_1.prisma.directMessage.create({
            data: { senderId, receiverId, content: trimmedContent },
        });
        return res.json(message);
    }
    catch (error) {
        console.error("sendMessageController error:", {
            message: error instanceof Error ? error.message : "Unknown error",
            code: typeof error === "object" && error && "code" in error ? error.code : undefined,
            meta: typeof error === "object" && error && "meta" in error ? error.meta : undefined,
        });
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
exports.sendMessageController = sendMessageController;
async function getConversationsController(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const users = await prisma_1.prisma.user.findMany({
            where: {
                OR: [
                    { sentDirectMessages: { some: { receiverId: userId } } },
                    { receivedDirectMessages: { some: { senderId: userId } } },
                ],
            },
            select: { id: true, email: true, username: true },
        });
        const conversations = await Promise.all(users.map(async (user) => {
            const lastMessage = await prisma_1.prisma.directMessage.findFirst({
                where: {
                    OR: [
                        { senderId: userId, receiverId: user.id },
                        { senderId: user.id, receiverId: userId },
                    ],
                },
                orderBy: { createdAt: "desc" },
            });
            return { user, lastMessage };
        }));
        conversations.sort((a, b) => {
            if (!a.lastMessage || !b.lastMessage)
                return 0;
            return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
        });
        return res.json(conversations);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
exports.getConversationsController = getConversationsController;
async function getMessagesWithUserController(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { otherUserId } = req.params;
        const messages = await prisma_1.prisma.directMessage.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: "asc" },
        });
        return res.json(messages);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
exports.getMessagesWithUserController = getMessagesWithUserController;
