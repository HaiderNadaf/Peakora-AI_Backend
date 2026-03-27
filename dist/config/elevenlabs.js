"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elevenLabsVoiceId = exports.elevenLabsApiKey = void 0;
exports.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY ?? "";
exports.elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
if (!exports.elevenLabsApiKey) {
    // Keep startup resilient; request handlers will fail fast with a clear message.
    console.warn("ELEVENLABS_API_KEY is not set.");
}
