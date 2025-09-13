import { prisma } from '../config/prisma';

export const StepsRepo = {
  findByUserId(userId: number) {
    return prisma.stepsDaily.findMany({ 
      where: { userId },
      orderBy: { stepDate: 'desc' }
    });
  },

  findByUserIdAndDate(userId: number, dateString: string) {
    return prisma.stepsDaily.findFirst({
      where: {
        userId,
        stepDate: new Date(dateString)
      }
    });
  },

  async upsertByUserIdAndDate(userId: number, dateString: string, stepCount: number) {
    const stepDate = new Date(dateString);
    
    return prisma.stepsDaily.upsert({
      where: {
        uq_user_day: {
          userId,
          stepDate
        }
      },
      update: {
        stepCount,
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        stepDate,
        stepCount,
      },
    });
  },
};
