"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const chatRouter = (0, express_1.Router)();
chatRouter.post("/", chat_controller_1.chatController);
exports.default = chatRouter;
