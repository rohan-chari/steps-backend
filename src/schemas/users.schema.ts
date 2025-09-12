import { z } from 'zod';

export const UserSyncSchema = z.object({
  // Accept both formats for flexibility
  firebaseUid: z.string().min(1, 'Firebase UID is required'),
  uid: z.string().min(1, 'UID is required').optional(), // Apple Sign-In format
  email: z.string().email('Valid email is required'),
  username: z.string().min(1, 'Username is required').or(z.literal('')),
  displayName: z.string().optional().nullable(),
  emailVerified: z.boolean().optional().default(false),
  photoUrl: z.string().url().optional().nullable().or(z.literal('')),
  photoURL: z.string().url().optional().nullable().or(z.literal('')), // Apple Sign-In format
  expoPushToken: z.string().optional(),
  step_goal: z.number().int().min(1).optional().default(10000),
  is_onboarded: z.boolean().optional().default(false),
}).transform((data) => {
  // Generate a username if none provided
  const username = data.username || `user_${data.firebaseUid.slice(-8)}`;
  
  // Transform the data to our backend format
  return {
    firebaseUid: data.firebaseUid || data.uid!,
    email: data.email,
    username: username,
    displayName: data.displayName || null,
    emailVerified: data.emailVerified || false,
    photoUrl: data.photoUrl || data.photoURL || null,
    expoPushToken: data.expoPushToken,
    stepGoal: data.step_goal || 10000,
    isOnboarded: data.is_onboarded || false,
  };
});

export type UserSyncData = z.infer<typeof UserSyncSchema>;
