import { Router } from "express";
import {
  createSessionController,
  getDirectConversationController,
  getSessionController,
  listSessionsController,
  listUsersController,
  researchController,
  sendDirectMessageController,
  tagResearchController,
} from "../controllers/collab.controller";

const collabRouter = Router();

collabRouter.get("/users", listUsersController);
collabRouter.get("/sessions", listSessionsController);
collabRouter.post("/sessions", createSessionController);
collabRouter.get("/sessions/:sessionId", getSessionController);
collabRouter.post("/sessions/:sessionId/research", researchController);
collabRouter.get("/sessions/:sessionId/direct/:userId", getDirectConversationController);
collabRouter.post("/sessions/:sessionId/tag", tagResearchController);
collabRouter.post("/direct/:conversationId/messages", sendDirectMessageController);

export default collabRouter;
