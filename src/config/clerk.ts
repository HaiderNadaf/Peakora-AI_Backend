export const clerkSecretKey = process.env.CLERK_SECRET_KEY ?? "";
export const clerkPublishableKey =
  process.env.CLERK_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  "";

if (!clerkSecretKey) {
  console.warn("Missing CLERK_SECRET_KEY in backend/.env");
}

if (!clerkPublishableKey) {
  console.warn(
    "Missing Clerk publishable key in .env. Set CLERK_PUBLISHABLE_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, or EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.",
  );
}
