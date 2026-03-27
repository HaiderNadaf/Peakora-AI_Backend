"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupController = signupController;
exports.loginController = loginController;
exports.meController = meController;
const prisma_1 = require("../config/prisma");
const auth_service_1 = require("../services/auth.service");
async function signupController(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password || password.length < 6) {
            return res.status(400).json({ error: "Email and password (min 6 chars) are required" });
        }
        const result = await (0, auth_service_1.signup)(email.toLowerCase().trim(), password);
        return res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(400).json({ error: message });
    }
}
async function loginController(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const result = await (0, auth_service_1.login)(email.toLowerCase().trim(), password);
        return res.json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(401).json({ error: message });
    }
}
async function meController(req, res) {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, createdAt: true },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(user);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
}
