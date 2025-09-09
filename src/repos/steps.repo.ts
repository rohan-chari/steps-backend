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
};
