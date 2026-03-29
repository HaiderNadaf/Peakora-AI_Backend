import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";
import authRouter from "./routes/auth.routes";
import chatRouter from "./routes/chat.routes";
import voiceRouter from "./routes/voice.routes";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const origin = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

app.use(helmet());
app.use(cors({ origin }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/api/voice", voiceRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
