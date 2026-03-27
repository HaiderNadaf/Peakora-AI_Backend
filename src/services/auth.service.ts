import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  console.warn("JWT_SECRET is not set.");
}

export async function signup(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  return issueToken(user.id);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  return issueToken(user.id);
}

export function verifyToken(token: string) {
  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in server .env");
  }

  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

function issueToken(userId: string) {
  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in server .env");
  }

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
  return { token, userId };
}
