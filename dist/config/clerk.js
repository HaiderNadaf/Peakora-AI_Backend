"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clerkSecretKey = exports.clerkPublishableKey = void 0;
exports.clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
exports.clerkSecretKey = process.env.CLERK_SECRET_KEY ?? "";
if (!exports.clerkPublishableKey) {
    console.warn("Missing Clerk publishable key in .env. Set CLERK_PUBLISHABLE_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, or EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.");
}
if (!exports.clerkSecretKey) {
    console.warn("Missing CLERK_SECRET_KEY in backend/.env");
}
