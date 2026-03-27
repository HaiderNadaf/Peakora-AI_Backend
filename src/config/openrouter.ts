import OpenAI from "openai";

const baseURL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const apiKey = process.env.OPENROUTER_API_KEY ?? "";

if (!apiKey) {
  // Keep startup resilient; request handlers will fail fast with a clear message.
  console.warn("OPENROUTER_API_KEY is not set.");
}

export const openrouterClient = new OpenAI({
  apiKey,
  baseURL,
});

export const openrouterModel =
  process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
