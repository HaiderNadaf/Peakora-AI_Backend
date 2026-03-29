import { Request, Response } from "express";
import {
  createResearchMessage,
  createSession,
  getDirectConversationForUsers,
  getSessionDetails,
  listSessions,
  listUsers,
  sendDirectMessage,
  tagResearchToUser,
} from "../services/collab.service";

function requireUserId(req: Request) {
  if (!req.userId) {
    throw new Error("Unauthorized");
  }

  return req.userId;
}

function getRouteParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export async function listUsersController(req: Request, res: Response) {
  try {
    const userId = requireUserId(req);
    const users = await listUsers(userId);
    return res.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
  }
}

export async function createSessionController(req: Request, res: Response) {
  try {
    const userId = requireUserId(req);
    const { title, topic, participantIds } = req.body as {
      title?: string;
      topic?: string;
      participantIds?: string[];
    };

    if (!title?.trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    const session = await createSession(userId, {
      title: title.trim(),
      topic: topic?.trim(),
      participantIds,
    });
    return res.status(201).json({ session });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
  }
}

export async function listSessionsController(req: Request, res: Response) {
  try {
    const userId = requireUserId(req);
    const sessions = await listSessions(userId);
    return res.json({ sessions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
  }
}

export async function getSessionController(req: Request, res: Response) {
  try {
    const userId = requireUserId(req);
    const session = await getSessionDetails(getRouteParam(req.params.sessionId), userId);
    return res.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
  }
}

export async function researchController(req: Request, res: Response) {
  try {
    const userId = requireUserId(req);
    const { query } = req.body as { query?: string };

    if (!query?.trim()) {
      return res.status(400).json({ error: "query is required" });
    }

    const data = await createResearchMessage(
      getRouteParam(req.params.sessionId),
      userId,
      query.trim()
    );
    return res.status(201).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
  }
}

export async function getDirectConversationController(req: Request, res: Response) {
  try {
    const userId = requireUserId(req);
    const conversation = await getDirectConversationForUsers(
      getRouteParam(req.params.sessionId),
      userId,
      getRouteParam(req.params.userId)
    );
    return res.json({ conversation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
  }
}

export async function sendDirectMessageController(req: Request, res: Response) {
  try {
    const userId = requireUserId(req);
    const { content } = req.body as { content?: string };

    if (!content?.trim()) {
      return res.status(400).json({ error: "content is required" });
    }

    const message = await sendDirectMessage(getRouteParam(req.params.conversationId), userId, {
      content: content.trim(),
    });
    return res.status(201).json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
  }
}

export async function tagResearchController(req: Request, res: Response) {
  try {
    const userId = requireUserId(req);
    const { targetUserId, sessionMessageId, note } = req.body as {
      targetUserId?: string;
      sessionMessageId?: string;
      note?: string;
    };

    if (!targetUserId || !sessionMessageId) {
      return res.status(400).json({ error: "targetUserId and sessionMessageId are required" });
    }

    const result = await tagResearchToUser(getRouteParam(req.params.sessionId), userId, {
      targetUserId,
      sessionMessageId,
      note,
    });
    return res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(message === "Unauthorized" ? 401 : 500).json({ error: message });
  }
}
