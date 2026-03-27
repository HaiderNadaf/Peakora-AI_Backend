import { Router } from "express";
import { chatController, chatHistoryController } from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const chatRouter = Router();

chatRouter.use(authMiddleware);
chatRouter.get("/history", chatHistoryController);
chatRouter.post("/", chatController);

export default chatRouter;
