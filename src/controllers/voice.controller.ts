import { Request, Response } from "express";
import { speechToText, textToSpeech } from "../services/voice.service";

export async function voiceController(req: Request, res: Response) {
  try {
    const { text } = req.body as { text?: string };

    if (!text?.trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const audioBuffer = await textToSpeech(text);
    res.setHeader("Content-Type", "audio/mpeg");
    return res.send(audioBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

export async function voiceBase64Controller(req: Request, res: Response) {
  try {
    const { text } = req.body as { text?: string };

    if (!text?.trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const audioBuffer = await textToSpeech(text);
    return res.json({
      mimeType: "audio/mpeg",
      audioBase64: audioBuffer.toString("base64"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

export async function speechToTextController(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "audio file is required" });
    }

    const text = await speechToText(
      file.buffer,
      file.originalname || "recording.m4a",
      file.mimetype || "audio/m4a"
    );

    return res.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
