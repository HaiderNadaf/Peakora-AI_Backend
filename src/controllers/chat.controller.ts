import { Request, Response } from "express";
import { generateChatReply } from "../services/chat.service";

export async function chatController(req: Request, res: Response) {
  try {
    const { message } = req.body as { message?: string };

    if (!message?.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const reply = await generateChatReply(message);
    return res.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
