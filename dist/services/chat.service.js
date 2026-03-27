"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChatReply = generateChatReply;
const openrouter_1 = require("../config/openrouter");
async function generateChatReply(message) {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("Missing OPENROUTER_API_KEY in server .env");
    }
    const completion = await openrouter_1.openrouterClient.chat.completions.create({
        model: openrouter_1.openrouterModel,
        messages: [{ role: "user", content: message }],
    });
    return completion.choices[0]?.message?.content ?? "";
}
