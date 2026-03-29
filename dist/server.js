"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_2 = require("@clerk/express");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const voice_routes_1 = __importDefault(require("./routes/voice.routes"));
const clerk_1 = require("./config/clerk");
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 4000);
const origin = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";
const hasClerkKeys = Boolean(clerk_1.clerkPublishableKey && clerk_1.clerkSecretKey);
if (!hasClerkKeys) {
    console.warn("Clerk environment variables are not configured. Clerk auth will not be available.");
}
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin }));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json({ limit: "1mb" }));
if (hasClerkKeys) {
    app.use((0, express_2.clerkMiddleware)());
}
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/chat", chat_routes_1.default);
app.use("/api/voice", voice_routes_1.default);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
