"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepo = void 0;
const prisma_1 = require("../config/prisma");
exports.UsersRepo = {
    findByFirebaseUid(firebaseUid) {
        return prisma_1.prisma.user.findUnique({ where: { firebaseUid } });
    },
    async syncUser(userData) {
        const { firebaseUid, email, username, displayName, emailVerified, photoUrl, expoPushToken, stepGoal } = userData;
        // Use upsert to create or update the user
        return prisma_1.prisma.user.upsert({
            where: { firebaseUid },
            update: {
                email,
                username,
                displayName,
                emailVerified,
                photoUrl: photoUrl || null,
                expoPushToken,
                stepGoal,
                lastLoginAt: new Date(),
                updatedAt: new Date(),
            },
            create: {
                firebaseUid,
                email,
                username,
                displayName,
                emailVerified: emailVerified || false,
                photoUrl: photoUrl || null,
                expoPushToken,
                stepGoal,
                lastLoginAt: new Date(),
            },
        });
    },
};
//# sourceMappingURL=users.repo.js.map