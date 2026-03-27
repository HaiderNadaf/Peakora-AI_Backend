"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceController = voiceController;
exports.voiceBase64Controller = voiceBase64Controller;
exports.speechToTextController = speechToTextController;
const voice_service_1 = require("../services/voice.service");
async function voiceController(req, res) {
    try {
        const { text } = req.body;
        if (!text?.trim()) {
            return res.status(400).json({ error: "text is required" });
        }
        const audioBuffer = await (0, voice_service_1.textToSpeech)(text);
        res.setHeader("Content-Type", "audio/mpeg");
        return res.send(audioBuffer);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
async function voiceBase64Controller(req, res) {
    try {
        const { text } = req.body;
        if (!text?.trim()) {
            return res.status(400).json({ error: "text is required" });
        }
        const audioBuffer = await (0, voice_service_1.textToSpeech)(text);
        return res.json({
            mimeType: "audio/mpeg",
            audioBase64: audioBuffer.toString("base64"),
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
async function speechToTextController(req, res) {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "audio file is required" });
        }
        const text = await (0, voice_service_1.speechToText)(file.buffer, file.originalname || "recording.m4a", file.mimetype || "audio/m4a");
        return res.json({ text });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
