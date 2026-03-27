import axios from "axios";
import { elevenLabsApiKey, elevenLabsVoiceId } from "../config/elevenlabs";

export async function textToSpeech(text: string) {
  if (!elevenLabsApiKey) {
    throw new Error("Missing ELEVENLABS_API_KEY in server .env");
  }

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
    {
      text,
      model_id: "eleven_multilingual_v2",
    },
    {
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsApiKey,
      },
    }
  );

  return Buffer.from(response.data);
}

export async function speechToText(
  audioBuffer: Buffer,
  filename: string,
  mimeType: string
) {
  if (!elevenLabsApiKey) {
    throw new Error("Missing ELEVENLABS_API_KEY in server .env");
  }

  const FormDataCtor = (globalThis as unknown as { FormData: new () => any }).FormData;
  const BlobCtor = (globalThis as unknown as {
    Blob: new (parts?: any[], options?: { type?: string }) => any;
  }).Blob;

  const form = new FormDataCtor();
  const blob = new BlobCtor([audioBuffer], { type: mimeType || "audio/m4a" });

  form.append("file", blob, filename || "recording.m4a");
  form.append("model_id", "scribe_v1");

  const response = await axios.post("https://api.elevenlabs.io/v1/speech-to-text", form, {
    headers: {
      "xi-api-key": elevenLabsApiKey,
    },
  });

  const text = (response.data?.text as string | undefined) ?? "";
  return text.trim();
}
