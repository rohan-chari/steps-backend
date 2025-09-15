import { z } from 'zod';

// Schema for sending a friend request
export const SendFriendRequestSchema = z.object({
  receiverId: z.number().int().positive('Receiver ID must be a positive integer'),
});

export type SendFriendRequestData = z.infer<typeof SendFriendRequestSchema>;

// Schema for responding to a friend request
export const RespondToFriendRequestSchema = z.object({
  requestId: z.number().int().positive('Request ID must be a positive integer'),
  status: z.enum(['accepted', 'rejected'], {
    errorMap: () => ({ message: 'Status must be either "accepted" or "rejected"' })
  }),
});

export type RespondToFriendRequestData = z.infer<typeof RespondToFriendRequestSchema>;

// Schema for canceling a friend request
export const CancelFriendRequestSchema = z.object({
  requestId: z.number().int().positive('Request ID must be a positive integer'),
});

export type CancelFriendRequestData = z.infer<typeof CancelFriendRequestSchema>;
