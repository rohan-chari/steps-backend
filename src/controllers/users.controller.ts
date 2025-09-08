import { Request, Response } from 'express';
import { UsersRepo } from '../repos/users.repo';

// TODO(auth): replace with real auth middleware (Firebase/local-jwt)
// For now we read a single dev UID from env and fetch that user.
const DEV_UID = 'uid-123';

export const UsersController = {
  me: async (_req: Request, res: Response) => {
    const user = await UsersRepo.findByFirebaseUid(DEV_UID);
    if (!user) return res.status(404).json({ error: 'User not found (dev uid)' });
    console.log('user', user);
    return res.json(user);
  },
};
