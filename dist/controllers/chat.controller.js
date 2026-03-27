"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = chatController;
const chat_service_1 = require("../services/chat.service");
async function chatController(req, res) {
    try {
        const { message } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({ error: "message is required" });
        }
        const reply = await (0, chat_service_1.generateChatReply)(message);
        return res.json({ reply });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
