import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  chatController,
  chatHistoryController,
} from "../controllers/chat.controller";

const chatRouter = Router();

chatRouter.use(authMiddleware);
chatRouter.get("/history", chatHistoryController);
chatRouter.post("/", chatController);

export default chatRouter;
