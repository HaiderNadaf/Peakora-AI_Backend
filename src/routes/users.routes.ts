import { Router } from "express";
import { getUsersController, updatePushTokenController } from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getUsersController);
router.post("/push-token", updatePushTokenController);

export default router;
