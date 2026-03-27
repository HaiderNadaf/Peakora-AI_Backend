export const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY ?? "";
export const elevenLabsVoiceId =
  process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";

if (!elevenLabsApiKey) {
  // Keep startup resilient; request handlers will fail fast with a clear message.
  console.warn("ELEVENLABS_API_KEY is not set.");
}
