"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.textToSpeech = textToSpeech;
exports.speechToText = speechToText;
const axios_1 = __importDefault(require("axios"));
const elevenlabs_1 = require("../config/elevenlabs");
async function textToSpeech(text) {
    if (!elevenlabs_1.elevenLabsApiKey) {
        throw new Error("Missing ELEVENLABS_API_KEY in server .env");
    }
    const response = await axios_1.default.post(`https://api.elevenlabs.io/v1/text-to-speech/${elevenlabs_1.elevenLabsVoiceId}`, {
        text,
        model_id: "eleven_multilingual_v2",
    }, {
        responseType: "arraybuffer",
        headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenlabs_1.elevenLabsApiKey,
        },
    });
    return Buffer.from(response.data);
}
async function speechToText(audioBuffer, filename, mimeType) {
    if (!elevenlabs_1.elevenLabsApiKey) {
        throw new Error("Missing ELEVENLABS_API_KEY in server .env");
    }
    const FormDataCtor = globalThis.FormData;
    const BlobCtor = globalThis.Blob;
    const form = new FormDataCtor();
    const blob = new BlobCtor([audioBuffer], { type: mimeType || "audio/m4a" });
    form.append("file", blob, filename || "recording.m4a");
    form.append("model_id", "scribe_v1");
    try {
        const response = await axios_1.default.post("https://api.elevenlabs.io/v1/speech-to-text", form, {
            headers: {
                "xi-api-key": elevenlabs_1.elevenLabsApiKey,
            },
        });
        const text = response.data?.text ?? "";
        return text.trim();
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401) {
                throw new Error("ElevenLabs STT unauthorized: check ELEVENLABS_API_KEY on backend");
            }
            if (status === 422) {
                throw new Error("ElevenLabs STT rejected audio format");
            }
            throw new Error(`ElevenLabs STT failed with status ${status ?? "unknown"}`);
        }
        throw error;
    }
}
