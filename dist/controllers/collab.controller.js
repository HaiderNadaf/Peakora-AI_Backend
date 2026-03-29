"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersController = listUsersController;
exports.createSessionController = createSessionController;
exports.listSessionsController = listSessionsController;
exports.getSessionController = getSessionController;
exports.researchController = researchController;
exports.getDirectConversationController = getDirectConversationController;
exports.sendDirectMessageController = sendDirectMessageController;
exports.tagResearchController = tagResearchController;
const collab_service_1 = require("../services/collab.service");
function requireUserId(req) {
    if (!req.userId) {
        throw new Error("Unauthorized");
    }
    return req.userId;
}
function getRouteParam(value) {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }
    return value ?? "";
}
async function listUsersController(req, res) {
    try {
        const userId = requireUserId(req);
        const users = await (0, collab_service_1.listUsers)(userId);
        return res.json({ users });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
    }
}
async function createSessionController(req, res) {
    try {
        const userId = requireUserId(req);
        const { title, topic, participantIds } = req.body;
        if (!title?.trim()) {
            return res.status(400).json({ error: "title is required" });
        }
        const session = await (0, collab_service_1.createSession)(userId, {
            title: title.trim(),
            topic: topic?.trim(),
            participantIds,
        });
        return res.status(201).json({ session });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
    }
}
async function listSessionsController(req, res) {
    try {
        const userId = requireUserId(req);
        const sessions = await (0, collab_service_1.listSessions)(userId);
        return res.json({ sessions });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
    }
}
async function getSessionController(req, res) {
    try {
        const userId = requireUserId(req);
        const session = await (0, collab_service_1.getSessionDetails)(getRouteParam(req.params.sessionId), userId);
        return res.json(session);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
    }
}
async function researchController(req, res) {
    try {
        const userId = requireUserId(req);
        const { query } = req.body;
        if (!query?.trim()) {
            return res.status(400).json({ error: "query is required" });
        }
        const data = await (0, collab_service_1.createResearchMessage)(getRouteParam(req.params.sessionId), userId, query.trim());
        return res.status(201).json(data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
    }
}
async function getDirectConversationController(req, res) {
    try {
        const userId = requireUserId(req);
        const conversation = await (0, collab_service_1.getDirectConversationForUsers)(getRouteParam(req.params.sessionId), userId, getRouteParam(req.params.userId));
        return res.json({ conversation });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
    }
}
async function sendDirectMessageController(req, res) {
    try {
        const userId = requireUserId(req);
        const { content } = req.body;
        if (!content?.trim()) {
            return res.status(400).json({ error: "content is required" });
        }
        const message = await (0, collab_service_1.sendDirectMessage)(getRouteParam(req.params.conversationId), userId, {
            content: content.trim(),
        });
        return res.status(201).json({ message });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
    }
}
async function tagResearchController(req, res) {
    try {
        const userId = requireUserId(req);
        const { targetUserId, sessionMessageId, note } = req.body;
        if (!targetUserId || !sessionMessageId) {
            return res.status(400).json({ error: "targetUserId and sessionMessageId are required" });
        }
        const result = await (0, collab_service_1.tagResearchToUser)(getRouteParam(req.params.sessionId), userId, {
            targetUserId,
            sessionMessageId,
            note,
        });
        return res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
    }
}
