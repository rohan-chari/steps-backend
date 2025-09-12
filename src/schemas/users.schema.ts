import { z } from 'zod';

// Simple sync schema - just ensures user exists in DB
export const UserSyncSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export type UserSyncData = z.infer<typeof UserSyncSchema>;

// User update schema for profile updates
export const UserUpdateSchema = z.object({
  username: z.string().min(1, 'Username is required').optional(),
  displayName: z.string().min(1, 'Display name is required').optional(),
  stepGoal: z.number().int().min(1, 'Step goal must be at least 1').optional(),
  photoUrl: z.string().url().optional().nullable().or(z.literal('')),
  expoPushToken: z.string().optional(),
  isOnboarded: z.boolean().optional(),
}).refine((data) => {
  // At least one field must be provided for update
  return Object.keys(data).some(key => data[key as keyof typeof data] !== undefined);
}, {
  message: "At least one field must be provided for update"
});

export type UserUpdateData = z.infer<typeof UserUpdateSchema>;
