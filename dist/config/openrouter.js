"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openrouterModel = exports.openrouterClient = void 0;
const openai_1 = __importDefault(require("openai"));
const baseURL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const apiKey = process.env.OPENROUTER_API_KEY ?? "";
if (!apiKey) {
    // Keep startup resilient; request handlers will fail fast with a clear message.
    console.warn("OPENROUTER_API_KEY is not set.");
}
exports.openrouterClient = new openai_1.default({
    apiKey,
    baseURL,
});
exports.openrouterModel = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
