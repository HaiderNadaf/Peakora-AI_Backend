"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const direct_messages_controller_1 = require("../controllers/direct-messages.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get("/", direct_messages_controller_1.getConversationsController);
router.post("/", direct_messages_controller_1.sendMessageController);
router.get("/:otherUserId", direct_messages_controller_1.getMessagesWithUserController);
exports.default = router;
