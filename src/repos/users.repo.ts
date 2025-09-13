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

  async calculateStreaks(userId: number) {
    // Get user's step goal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stepGoal: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get all steps data for the user, ordered by date descending
    const stepsData = await prisma.stepsDaily.findMany({
      where: { userId },
      orderBy: { stepDate: 'desc' },
      select: {
        stepDate: true,
        stepCount: true
      }
    });

    if (stepsData.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0
      };
    }

    // Convert to a map for easier lookup
    const stepsMap = new Map<string, number>();
    stepsData.forEach((step: { stepDate: Date; stepCount: number }) => {
      const dateKey = step.stepDate.toISOString().split('T')[0];
      stepsMap.set(dateKey, step.stepCount);
    });

    // Calculate current streak (from today backwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // Check consecutive days from today backwards
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      const stepCount = stepsMap.get(dateKey) || 0;
      const hasData = stepsMap.has(dateKey);
      
      if (checkDate.getTime() === today.getTime()) {
        // This is today
        if (!hasData) {
          // No data for today yet - skip today and continue checking backwards
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        } else if (stepCount < user.stepGoal) {
          // We have data for today but didn't meet goal - skip today and continue checking backwards
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        } else {
          // We have data for today and met goal - count today and continue
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      } else {
        // This is a past day
        if (stepCount >= user.stepGoal) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Get all dates from earliest to latest
    const allDates = Array.from(stepsMap.keys()).sort();
    
    for (const dateKey of allDates) {
      const stepCount = stepsMap.get(dateKey) || 0;
      
      if (stepCount >= user.stepGoal) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      currentStreak,
      longestStreak
    };
  },

  async searchUsers(query: string, currentUserId: number, limit: number = 10) {
    if (!query || query.trim().length < 2) return [];
  
    const searchTerm = query.trim();
  
    return await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        isActive: true,
        OR: [
          { username: { contains: searchTerm} },
          { displayName: { contains: searchTerm } }
        ]
      },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
      orderBy: { username: 'asc' },
      take: limit
    });
  }
};
