import type { IncomingMessage } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { verifyToken } from "@clerk/backend";
import { clerkSecretKey } from "../config/clerk";
import { syncClerkUser } from "./clerk-user.service";

type SocketEvent =
  | {
      type: "session.updated";
      payload: { sessionId: string };
    }
  | {
      type: "direct.updated";
      payload: { conversationId: string; sessionId: string };
    };

const clientsByUserId = new Map<string, Set<WebSocket>>();

function getTokenFromRequest(req: IncomingMessage) {
  const url = new URL(req.url ?? "/", "http://localhost");
  return url.searchParams.get("token") ?? "";
}

export function attachRealtimeServer(wss: WebSocketServer) {
  wss.on("connection", (socket, req) => {
    void (async () => {
      try {
        if (!clerkSecretKey) {
          throw new Error("Missing Clerk secret key");
        }

        const token = getTokenFromRequest(req);
        const payload = await verifyToken(token, { secretKey: clerkSecretKey });
        const clerkUserId = payload.sub;
        if (!clerkUserId) {
          throw new Error("Unauthorized");
        }

        const user = await syncClerkUser(clerkUserId);
        const existing = clientsByUserId.get(user.id) ?? new Set<WebSocket>();
        existing.add(socket);
        clientsByUserId.set(user.id, existing);

        socket.on("close", () => {
          const sockets = clientsByUserId.get(user.id);
          if (!sockets) return;
          sockets.delete(socket);
          if (sockets.size === 0) {
            clientsByUserId.delete(user.id);
          }
        });
      } catch {
        socket.close(1008, "Unauthorized");
      }
    })();
  });
}

export function publishToUsers(userIds: string[], event: SocketEvent) {
  const payload = JSON.stringify(event);
  for (const userId of userIds) {
    const sockets = clientsByUserId.get(userId);
    if (!sockets) continue;
    for (const socket of sockets) {
      if (socket.readyState === socket.OPEN) {
        socket.send(payload);
      }
    }
  }
}
