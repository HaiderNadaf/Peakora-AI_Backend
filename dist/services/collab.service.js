"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.createSession = createSession;
exports.listSessions = listSessions;
exports.getSessionDetails = getSessionDetails;
exports.createResearchMessage = createResearchMessage;
exports.getDirectConversationForUsers = getDirectConversationForUsers;
exports.sendDirectMessage = sendDirectMessage;
exports.tagResearchToUser = tagResearchToUser;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
const chat_service_1 = require("./chat.service");
const realtime_service_1 = require("./realtime.service");
function normalizePair(userIdA, userIdB) {
    return [userIdA, userIdB].sort();
}
async function ensureSessionMember(sessionId, userId) {
    const member = await prisma_1.prisma.sessionParticipant.findUnique({
        where: {
            sessionId_userId: {
                sessionId,
                userId,
            },
        },
    });
    if (!member) {
        throw new Error("You are not a participant in this session");
    }
}
async function getSessionParticipantIds(sessionId) {
    const participants = await prisma_1.prisma.sessionParticipant.findMany({
        where: { sessionId },
        select: { userId: true },
    });
    return participants.map((participant) => participant.userId);
}
async function getOrCreateConversation(sessionId, userIdA, userIdB) {
    const [participantAId, participantBId] = normalizePair(userIdA, userIdB);
    const existing = await prisma_1.prisma.directConversation.findUnique({
        where: {
            sessionId_participantAId_participantBId: {
                sessionId,
                participantAId,
                participantBId,
            },
        },
    });
    if (existing) {
        return existing;
    }
    return prisma_1.prisma.directConversation.create({
        data: {
            sessionId,
            participantAId,
            participantBId,
        },
    });
}
async function listUsers(userId) {
    const users = await prisma_1.prisma.user.findMany({
        where: { id: { not: userId } },
        orderBy: { email: "asc" },
        select: {
            id: true,
            email: true,
        },
    });
    return users;
}
async function createSession(ownerId, payload) {
    const participantIds = Array.from(new Set([ownerId, ...(payload.participantIds ?? [])]));
    const session = await prisma_1.prisma.session.create({
        data: {
            title: payload.title,
            topic: payload.topic,
            ownerId,
            participants: {
                create: participantIds.map((participantId) => ({
                    userId: participantId,
                })),
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
    (0, realtime_service_1.publishToUsers)(session.participants.map((participant) => participant.userId), { type: "session.updated", payload: { sessionId: session.id } });
    return session;
}
async function listSessions(userId) {
    return prisma_1.prisma.session.findMany({
        where: {
            participants: {
                some: { userId },
            },
        },
        orderBy: { updatedAt: "desc" },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
}
async function getSessionDetails(sessionId, userId) {
    await ensureSessionMember(sessionId, userId);
    const [session, directChats] = await Promise.all([
        prisma_1.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        author: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                    take: 200,
                },
            },
        }),
        prisma_1.prisma.directConversation.findMany({
            where: {
                sessionId,
                OR: [{ participantAId: userId }, { participantBId: userId }],
            },
            orderBy: { updatedAt: "desc" },
            include: {
                participantA: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                participantB: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        }),
    ]);
    return { session, directChats };
}
async function createResearchMessage(sessionId, userId, query) {
    await ensureSessionMember(sessionId, userId);
    const requestMessage = await prisma_1.prisma.sessionMessage.create({
        data: {
            sessionId,
            authorId: userId,
            kind: client_1.SessionMessageKind.research_request,
            content: query,
        },
    });
    const answer = await (0, chat_service_1.generateChatReply)(`Research this request carefully and provide a concise, useful answer.\n\nRequest: ${query}`);
    const resultMessage = await prisma_1.prisma.sessionMessage.create({
        data: {
            sessionId,
            authorId: userId,
            kind: client_1.SessionMessageKind.research_result,
            content: answer,
        },
    });
    const participantIds = await getSessionParticipantIds(sessionId);
    (0, realtime_service_1.publishToUsers)(participantIds, { type: "session.updated", payload: { sessionId } });
    return { requestMessage, resultMessage };
}
async function getDirectConversationForUsers(sessionId, currentUserId, otherUserId) {
    await ensureSessionMember(sessionId, currentUserId);
    await ensureSessionMember(sessionId, otherUserId);
    const conversation = await getOrCreateConversation(sessionId, currentUserId, otherUserId);
    return prisma_1.prisma.directConversation.findUnique({
        where: { id: conversation.id },
        include: {
            participantA: {
                select: {
                    id: true,
                    email: true,
                },
            },
            participantB: {
                select: {
                    id: true,
                    email: true,
                },
            },
            messages: {
                orderBy: { createdAt: "asc" },
                include: {
                    sender: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                    sourceSessionMessage: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
                take: 200,
            },
        },
    });
}
async function sendDirectMessage(conversationId, senderId, payload) {
    const conversation = await prisma_1.prisma.directConversation.findUnique({
        where: { id: conversationId },
    });
    if (!conversation) {
        throw new Error("Conversation not found");
    }
    if (![conversation.participantAId, conversation.participantBId].includes(senderId)) {
        throw new Error("You are not part of this conversation");
    }
    const message = await prisma_1.prisma.directMessage.create({
        data: {
            conversationId,
            senderId,
            content: payload.content,
            kind: client_1.DirectMessageKind.text,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });
    (0, realtime_service_1.publishToUsers)([conversation.participantAId, conversation.participantBId], {
        type: "direct.updated",
        payload: { conversationId, sessionId: conversation.sessionId },
    });
    return message;
}
async function tagResearchToUser(sessionId, senderId, payload) {
    await ensureSessionMember(sessionId, senderId);
    await ensureSessionMember(sessionId, payload.targetUserId);
    const sessionMessage = await prisma_1.prisma.sessionMessage.findUnique({
        where: { id: payload.sessionMessageId },
    });
    if (!sessionMessage || sessionMessage.sessionId !== sessionId) {
        throw new Error("Research message not found in this session");
    }
    const conversation = await getOrCreateConversation(sessionId, senderId, payload.targetUserId);
    const message = await prisma_1.prisma.directMessage.create({
        data: {
            conversationId: conversation.id,
            senderId,
            kind: client_1.DirectMessageKind.tagged_research,
            content: payload.note?.trim() || null,
            sourceSessionMessageId: sessionMessage.id,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    email: true,
                },
            },
            sourceSessionMessage: {
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
    (0, realtime_service_1.publishToUsers)([conversation.participantAId, conversation.participantBId], {
        type: "direct.updated",
        payload: { conversationId: conversation.id, sessionId },
    });
    return { conversationId: conversation.id, message };
}
