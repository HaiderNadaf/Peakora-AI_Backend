"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachRealtimeServer = attachRealtimeServer;
exports.publishToUsers = publishToUsers;
const backend_1 = require("@clerk/backend");
const clerk_1 = require("../config/clerk");
const clerk_user_service_1 = require("./clerk-user.service");
const clientsByUserId = new Map();
function getTokenFromRequest(req) {
    const url = new URL(req.url ?? "/", "http://localhost");
    return url.searchParams.get("token") ?? "";
}
function attachRealtimeServer(wss) {
    wss.on("connection", (socket, req) => {
        void (async () => {
            try {
                if (!clerk_1.clerkSecretKey) {
                    throw new Error("Missing Clerk secret key");
                }
                const token = getTokenFromRequest(req);
                const payload = await (0, backend_1.verifyToken)(token, { secretKey: clerk_1.clerkSecretKey });
                const clerkUserId = payload.sub;
                if (!clerkUserId) {
                    throw new Error("Unauthorized");
                }
                const user = await (0, clerk_user_service_1.syncClerkUser)(clerkUserId);
                const existing = clientsByUserId.get(user.id) ?? new Set();
                existing.add(socket);
                clientsByUserId.set(user.id, existing);
                socket.on("close", () => {
                    const sockets = clientsByUserId.get(user.id);
                    if (!sockets)
                        return;
                    sockets.delete(socket);
                    if (sockets.size === 0) {
                        clientsByUserId.delete(user.id);
                    }
                });
            }
            catch {
                socket.close(1008, "Unauthorized");
            }
        })();
    });
}
function publishToUsers(userIds, event) {
    const payload = JSON.stringify(event);
    for (const userId of userIds) {
        const sockets = clientsByUserId.get(userId);
        if (!sockets)
            continue;
        for (const socket of sockets) {
            if (socket.readyState === socket.OPEN) {
                socket.send(payload);
            }
        }
    }
}
