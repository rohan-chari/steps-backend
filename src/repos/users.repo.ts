import { prisma } from '../config/prisma';

export const UsersRepo = {
  findByFirebaseUid(firebaseUid: string) {
    return prisma.user.findUnique({ where: { firebaseUid } });
  },
};
