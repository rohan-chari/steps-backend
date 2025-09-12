import { prisma } from '../config/prisma';
import { UserSyncData } from '../schemas/users.schema';

export const UsersRepo = {
  findByFirebaseUid(firebaseUid: string) {
    return prisma.user.findUnique({ where: { firebaseUid } });
  },

  async syncUser(userData: UserSyncData) {
    const { firebaseUid, email, username, displayName, emailVerified, photoUrl, expoPushToken, stepGoal, isOnboarded } = userData;
    
    // Use upsert to create or update the user
    return prisma.user.upsert({
      where: { firebaseUid },
      update: {
        email,
        username,
        displayName,
        emailVerified,
        photoUrl: photoUrl || null,
        expoPushToken,
        stepGoal,
        isOnboarded,
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
        isOnboarded: isOnboarded || false,
        lastLoginAt: new Date(),
      },
    });
  },
};
