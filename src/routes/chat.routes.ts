import { Router } from "express";
import { chatController } from "../controllers/chat.controller";

const chatRouter = Router();

chatRouter.post("/", chatController);

export default chatRouter;
