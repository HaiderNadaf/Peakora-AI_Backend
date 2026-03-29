"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncClerkUser = syncClerkUser;
const express_1 = require("@clerk/express");
const prisma_1 = require("../config/prisma");
function getPrimaryEmail(clerkUser) {
    return (clerkUser.emailAddresses.find((emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        `${clerkUser.id}@clerk.local`);
}
async function syncClerkUser(clerkUserId) {
    const existingById = await prisma_1.prisma.user.findUnique({ where: { id: clerkUserId } });
    if (existingById) {
        return existingById;
    }
    const clerkUser = await express_1.clerkClient.users.getUser(clerkUserId);
    const email = getPrimaryEmail(clerkUser);
    const existingByEmail = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
        return existingByEmail;
    }
    return prisma_1.prisma.user.create({
        data: {
            id: clerkUserId,
            email,
            passwordHash: "",
        },
    });
}
