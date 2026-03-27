import { Router } from "express";
import multer from "multer";
import {
  speechToTextController,
  voiceBase64Controller,
  voiceController,
} from "../controllers/voice.controller";

const voiceRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

voiceRouter.post("/tts", voiceController);
voiceRouter.post("/tts-base64", voiceBase64Controller);
voiceRouter.post("/stt", upload.single("audio"), speechToTextController);

export default voiceRouter;
