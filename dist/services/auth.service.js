"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.verifyToken = verifyToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    console.warn("JWT_SECRET is not set.");
}
async function signup(email, password) {
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error("Email already exists");
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            email,
            passwordHash,
        },
    });
    return issueToken(user.id);
}
async function login(email, password) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isValid) {
        throw new Error("Invalid email or password");
    }
    return issueToken(user.id);
}
function verifyToken(token) {
    if (!JWT_SECRET) {
        throw new Error("Missing JWT_SECRET in server .env");
    }
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
function issueToken(userId) {
    if (!JWT_SECRET) {
        throw new Error("Missing JWT_SECRET in server .env");
    }
    const token = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    return { token, userId };
}
