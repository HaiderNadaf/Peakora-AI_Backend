"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clerkSecretKey = exports.clerkPublishableKey = void 0;
exports.clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
exports.clerkSecretKey = process.env.CLERK_SECRET_KEY ?? "";
if (!exports.clerkPublishableKey) {
    console.warn("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in backend/.env");
}
if (!exports.clerkSecretKey) {
    console.warn("Missing CLERK_SECRET_KEY in backend/.env");
}
