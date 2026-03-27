"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const voice_controller_1 = require("../controllers/voice.controller");
const voiceRouter = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
voiceRouter.post("/tts", voice_controller_1.voiceController);
voiceRouter.post("/tts-base64", voice_controller_1.voiceBase64Controller);
voiceRouter.post("/stt", upload.single("audio"), voice_controller_1.speechToTextController);
exports.default = voiceRouter;
