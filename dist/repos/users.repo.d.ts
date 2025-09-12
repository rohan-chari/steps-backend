import { UserSyncData } from '../schemas/users.schema';
export declare const UsersRepo: {
    findByFirebaseUid(firebaseUid: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        firebaseUid: string;
        email: string;
        username: string;
        displayName: string | null;
        emailVerified: boolean;
        photoUrl: string | null;
        expoPushToken: string | null;
        stepGoal: number;
        id: number;
        challengeWins: number;
        challengeLosses: number;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    syncUser(userData: UserSyncData): Promise<{
        firebaseUid: string;
        email: string;
        username: string;
        displayName: string | null;
        emailVerified: boolean;
        photoUrl: string | null;
        expoPushToken: string | null;
        stepGoal: number;
        id: number;
        challengeWins: number;
        challengeLosses: number;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
//# sourceMappingURL=users.repo.d.ts.map