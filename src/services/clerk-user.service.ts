import { clerkClient } from "@clerk/express";
import { prisma } from "../config/prisma";

function getPrimaryEmail(clerkUser: Awaited<ReturnType<typeof clerkClient.users.getUser>>) {
  return (
    clerkUser.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${clerkUser.id}@clerk.local`
  );
}

export async function syncClerkUser(clerkUserId: string) {
  const existingById = await prisma.user.findUnique({ where: { id: clerkUserId } });
  if (existingById) {
    return existingById;
  }

  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = getPrimaryEmail(clerkUser);

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    return existingByEmail;
  }

  return prisma.user.create({
    data: {
      id: clerkUserId,
      email,
      passwordHash: "",
    },
  });
}
