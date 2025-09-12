import { prisma } from '../config/prisma';
import { UserSyncData, UserUpdateData } from '../schemas/users.schema';

export const UsersRepo = {
  findByFirebaseUid(firebaseUid: string) {
    return prisma.user.findUnique({ where: { firebaseUid } });
  },

  async createUserIfNotExists(firebaseUid: string, email: string) {
    // Use upsert to create user if they don't exist, or just return existing user
    return prisma.user.upsert({
      where: { firebaseUid },
      update: {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        firebaseUid,
        email,
        username: '',
        displayName: null,
        emailVerified: false,
        photoUrl: null,
        expoPushToken: null,
        stepGoal: 10000,
        isOnboarded: false,
        lastLoginAt: new Date(),
      },
    });
  },

  async updateUser(firebaseUid: string, updateData: UserUpdateData) {
    // Check if user exists
    const currentUser = await this.findByFirebaseUid(firebaseUid);
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    return prisma.user.update({
      where: { firebaseUid },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  },
};
