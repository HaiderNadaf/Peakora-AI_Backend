import { DirectMessageKind, SessionMessageKind } from "@prisma/client";
import { prisma } from "../config/prisma";
import { generateChatReply } from "./chat.service";
import { publishToUsers } from "./realtime.service";

function normalizePair(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort() as [string, string];
}

async function ensureSessionMember(sessionId: string, userId: string) {
  const member = await prisma.sessionParticipant.findUnique({
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

async function getSessionParticipantIds(sessionId: string) {
  const participants = await prisma.sessionParticipant.findMany({
    where: { sessionId },
    select: { userId: true },
  });
  return participants.map((participant) => participant.userId);
}

async function getOrCreateConversation(sessionId: string, userIdA: string, userIdB: string) {
  const [participantAId, participantBId] = normalizePair(userIdA, userIdB);

  const existing = await prisma.directConversation.findUnique({
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

  return prisma.directConversation.create({
    data: {
      sessionId,
      participantAId,
      participantBId,
    },
  });
}

export async function listUsers(userId: string) {
  const users = await prisma.user.findMany({
    where: { id: { not: userId } },
    orderBy: { email: "asc" },
    select: {
      id: true,
      email: true,
    },
  });

  return users;
}

export async function createSession(
  ownerId: string,
  payload: { title: string; topic?: string; participantIds?: string[] }
) {
  const participantIds = Array.from(new Set([ownerId, ...(payload.participantIds ?? [])]));

  const session = await prisma.session.create({
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

  publishToUsers(
    session.participants.map((participant) => participant.userId),
    { type: "session.updated", payload: { sessionId: session.id } }
  );

  return session;
}

export async function listSessions(userId: string) {
  return prisma.session.findMany({
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

export async function getSessionDetails(sessionId: string, userId: string) {
  await ensureSessionMember(sessionId, userId);

  const [session, directChats] = await Promise.all([
    prisma.session.findUnique({
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
    prisma.directConversation.findMany({
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

export async function createResearchMessage(sessionId: string, userId: string, query: string) {
  await ensureSessionMember(sessionId, userId);

  const requestMessage = await prisma.sessionMessage.create({
    data: {
      sessionId,
      authorId: userId,
      kind: SessionMessageKind.research_request,
      content: query,
    },
  });

  const answer = await generateChatReply(
    `Research this request carefully and provide a concise, useful answer.\n\nRequest: ${query}`
  );

  const resultMessage = await prisma.sessionMessage.create({
    data: {
      sessionId,
      authorId: userId,
      kind: SessionMessageKind.research_result,
      content: answer,
    },
  });

  const participantIds = await getSessionParticipantIds(sessionId);
  publishToUsers(participantIds, { type: "session.updated", payload: { sessionId } });

  return { requestMessage, resultMessage };
}

export async function getDirectConversationForUsers(
  sessionId: string,
  currentUserId: string,
  otherUserId: string
) {
  await ensureSessionMember(sessionId, currentUserId);
  await ensureSessionMember(sessionId, otherUserId);

  const conversation = await getOrCreateConversation(sessionId, currentUserId, otherUserId);

  return prisma.directConversation.findUnique({
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

export async function sendDirectMessage(
  conversationId: string,
  senderId: string,
  payload: { content: string }
) {
  const conversation = await prisma.directConversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (![conversation.participantAId, conversation.participantBId].includes(senderId)) {
    throw new Error("You are not part of this conversation");
  }

  const message = await prisma.directMessage.create({
    data: {
      conversationId,
      senderId,
      content: payload.content,
      kind: DirectMessageKind.text,
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

  publishToUsers([conversation.participantAId, conversation.participantBId], {
    type: "direct.updated",
    payload: { conversationId, sessionId: conversation.sessionId },
  });

  return message;
}

export async function tagResearchToUser(
  sessionId: string,
  senderId: string,
  payload: { targetUserId: string; sessionMessageId: string; note?: string }
) {
  await ensureSessionMember(sessionId, senderId);
  await ensureSessionMember(sessionId, payload.targetUserId);

  const sessionMessage = await prisma.sessionMessage.findUnique({
    where: { id: payload.sessionMessageId },
  });

  if (!sessionMessage || sessionMessage.sessionId !== sessionId) {
    throw new Error("Research message not found in this session");
  }

  const conversation = await getOrCreateConversation(sessionId, senderId, payload.targetUserId);

  const message = await prisma.directMessage.create({
    data: {
      conversationId: conversation.id,
      senderId,
      kind: DirectMessageKind.tagged_research,
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

  publishToUsers([conversation.participantAId, conversation.participantBId], {
    type: "direct.updated",
    payload: { conversationId: conversation.id, sessionId },
  });

  return { conversationId: conversation.id, message };
}
