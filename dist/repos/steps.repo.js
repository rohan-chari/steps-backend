"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepsRepo = void 0;
const prisma_1 = require("../config/prisma");
exports.StepsRepo = {
    findByUserId(userId) {
        return prisma_1.prisma.stepsDaily.findMany({
            where: { userId },
            orderBy: { stepDate: 'desc' }
        });
    },
    findByUserIdAndDate(userId, dateString) {
        return prisma_1.prisma.stepsDaily.findFirst({
            where: {
                userId,
                stepDate: new Date(dateString)
            }
        });
    },
};
//# sourceMappingURL=steps.repo.js.map