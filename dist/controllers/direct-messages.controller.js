"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesWithUserController = exports.getConversationsController = exports.sendMessageController = void 0;
const prisma_1 = require("../config/prisma");
const expo_server_sdk_1 = require("expo-server-sdk");
const expo = new expo_server_sdk_1.Expo();
async function sendMessageController(req, res) {
    try {
        const senderId = req.userId;
        if (!senderId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { receiverId, content } = req.body;
        if (!receiverId || !content) {
            return res.status(400).json({ error: "Missing receiverId or content" });
        }
        const message = await prisma_1.prisma.directMessage.create({
            data: { senderId, receiverId, content },
        });
        const receiver = await prisma_1.prisma.user.findUnique({
            where: { id: receiverId },
            select: { expoPushToken: true },
        });
        if ((receiver === null || receiver === void 0 ? void 0 : receiver.expoPushToken) && expo_server_sdk_1.Expo.isExpoPushToken(receiver.expoPushToken)) {
            try {
                const sender = await prisma_1.prisma.user.findUnique({ where: { id: senderId }, select: { username: true, email: true } });
                const senderName = (sender === null || sender === void 0 ? void 0 : sender.username) || ((sender === null || sender === void 0 ? void 0 : sender.email.split("@")[0]) || "Someone");
                await expo.sendPushNotificationsAsync([{
                        to: receiver.expoPushToken,
                        sound: "default",
                        title: `New message from ${senderName}`,
                        body: content,
                        data: { senderId },
                    }]);
            }
            catch (err) {
                console.error("Failed to send push notification:", err);
            }
        }
        return res.json(message);
    }
    catch (error) {
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
