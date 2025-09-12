"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSyncSchema = void 0;
const zod_1 = require("zod");
exports.UserSyncSchema = zod_1.z.object({
    // Accept both formats for flexibility
    firebaseUid: zod_1.z.string().min(1, 'Firebase UID is required'),
    uid: zod_1.z.string().min(1, 'UID is required').optional(), // Apple Sign-In format
    email: zod_1.z.string().email('Valid email is required'),
    username: zod_1.z.string().min(1, 'Username is required'),
    displayName: zod_1.z.string().optional().nullable(),
    emailVerified: zod_1.z.boolean().optional().default(false),
    photoUrl: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal('')),
    photoURL: zod_1.z.string().url().optional().nullable().or(zod_1.z.literal('')), // Apple Sign-In format
    expoPushToken: zod_1.z.string().optional(),
    step_goal: zod_1.z.number().int().min(1).optional().default(10000),
}).transform((data) => {
    // Transform the data to our backend format
    return {
        firebaseUid: data.firebaseUid || data.uid,
        email: data.email,
        username: data.username,
        displayName: data.displayName || null,
        emailVerified: data.emailVerified || false,
        photoUrl: data.photoUrl || data.photoURL || null,
        expoPushToken: data.expoPushToken,
        stepGoal: data.step_goal || 10000,
    };
});
//# sourceMappingURL=users.schema.js.map