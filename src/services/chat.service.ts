import { openrouterClient, openrouterModel } from "../config/openrouter";

export async function generateChatReply(message: string) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY in server .env");
  }

  const completion = await openrouterClient.chat.completions.create({
    model: openrouterModel,
    messages: [{ role: "user", content: message }],
  });

  return completion.choices[0]?.message?.content ?? "";
}
