import { Router } from "express";
import {
  getConversationsController,
  getMessagesWithUserController,
  sendMessageController,
} from "../controllers/direct-messages.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getConversationsController);
router.post("/", sendMessageController);
router.get("/:otherUserId", getMessagesWithUserController);

export default router;
