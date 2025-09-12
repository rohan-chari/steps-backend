import { z } from 'zod';
export declare const UserSyncSchema: z.ZodEffects<z.ZodObject<{
    firebaseUid: z.ZodString;
    uid: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    username: z.ZodString;
    displayName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    emailVerified: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    photoUrl: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    photoURL: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    expoPushToken: z.ZodOptional<z.ZodString>;
    step_goal: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    firebaseUid: string;
    email: string;
    username: string;
    emailVerified: boolean;
    step_goal: number;
    uid?: string | undefined;
    displayName?: string | null | undefined;
    photoUrl?: string | null | undefined;
    photoURL?: string | null | undefined;
    expoPushToken?: string | undefined;
}, {
    firebaseUid: string;
    email: string;
    username: string;
    uid?: string | undefined;
    displayName?: string | null | undefined;
    emailVerified?: boolean | undefined;
    photoUrl?: string | null | undefined;
    photoURL?: string | null | undefined;
    expoPushToken?: string | undefined;
    step_goal?: number | undefined;
}>, {
    firebaseUid: string;
    email: string;
    username: string;
    displayName: string | null;
    emailVerified: boolean;
    photoUrl: string | null;
    expoPushToken: string | undefined;
    stepGoal: number;
}, {
    firebaseUid: string;
    email: string;
    username: string;
    uid?: string | undefined;
    displayName?: string | null | undefined;
    emailVerified?: boolean | undefined;
    photoUrl?: string | null | undefined;
    photoURL?: string | null | undefined;
    expoPushToken?: string | undefined;
    step_goal?: number | undefined;
}>;
export type UserSyncData = z.infer<typeof UserSyncSchema>;
//# sourceMappingURL=users.schema.d.ts.map