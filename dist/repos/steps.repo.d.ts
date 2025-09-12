export declare const StepsRepo: {
    findByUserId(userId: number): import(".prisma/client").Prisma.PrismaPromise<{
        id: bigint;
        userId: number;
        stepDate: Date;
        stepCount: number;
        sourceHint: string | null;
        lastSyncedAt: Date;
    }[]>;
    findByUserIdAndDate(userId: number, dateString: string): import(".prisma/client").Prisma.Prisma__StepsDailyClient<{
        id: bigint;
        userId: number;
        stepDate: Date;
        stepCount: number;
        sourceHint: string | null;
        lastSyncedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
};
//# sourceMappingURL=steps.repo.d.ts.map