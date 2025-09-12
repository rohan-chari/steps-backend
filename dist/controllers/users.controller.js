"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_repo_1 = require("../repos/users.repo");
const logger_1 = require("../config/logger");
const users_schema_1 = require("../schemas/users.schema");
exports.UsersController = {
    me: async (req, res) => {
        try {
            const firebaseUid = req.user?.uid;
            if (!firebaseUid) {
                logger_1.logger.warn('No Firebase UID found in request');
                return res.status(401).json({ error: 'Unauthorized - no user ID found' });
            }
            logger_1.logger.info('Fetching user data', { firebaseUid });
            const user = await users_repo_1.UsersRepo.findByFirebaseUid(firebaseUid);
            if (!user) {
                logger_1.logger.warn('User not found in database', { firebaseUid });
                return res.status(404).json({ error: 'User not found in database' });
            }
            logger_1.logger.info('User fetched successfully', {
                userId: user.id,
                email: user.email,
                username: user.username
            });
            return res.json(user);
        }
        catch (error) {
            logger_1.logger.error('Error fetching user', {
                error: error instanceof Error ? error.message : 'Unknown error',
                firebaseUid: req.user?.uid,
                stack: error instanceof Error ? error.stack : undefined
            });
            return res.status(500).json({ error: 'Failed to fetch user' });
        }
    },
    sync: async (req, res) => {
        try {
            const firebaseUid = req.user?.uid;
            if (!firebaseUid) {
                logger_1.logger.warn('No Firebase UID found in request');
                return res.status(401).json({ error: 'Unauthorized - no user ID found' });
            }
            // Validate request body
            const validationResult = users_schema_1.UserSyncSchema.safeParse(req.body);
            if (!validationResult.success) {
                logger_1.logger.warn('Invalid sync request data', {
                    errors: validationResult.error.errors,
                    body: req.body,
                    errorMessage: validationResult.error.message,
                    errorIssues: validationResult.error.issues
                });
                return res.status(400).json({
                    error: 'Invalid request data',
                    message: validationResult.error.message,
                    details: validationResult.error.errors
                });
            }
            const userData = validationResult.data;
            // Override firebaseUid with the authenticated user's UID for security
            const secureUserData = {
                ...userData,
                firebaseUid: firebaseUid
            };
            logger_1.logger.info('Syncing user data', {
                firebaseUid: secureUserData.firebaseUid,
                email: secureUserData.email,
                username: secureUserData.username
            });
            const user = await users_repo_1.UsersRepo.syncUser(secureUserData);
            logger_1.logger.info('User synced successfully', {
                userId: user.id,
                firebaseUid: user.firebaseUid,
                email: user.email,
                username: user.username
            });
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    firebaseUid: user.firebaseUid,
                    email: user.email,
                    username: user.username,
                    displayName: user.displayName,
                    emailVerified: user.emailVerified,
                    photoUrl: user.photoUrl,
                    expoPushToken: user.expoPushToken,
                    stepGoal: user.stepGoal,
                    challengeWins: user.challengeWins,
                    challengeLosses: user.challengeLosses,
                    isActive: user.isActive,
                    lastLoginAt: user.lastLoginAt,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error syncing user', {
                error: error instanceof Error ? error.message : 'Unknown error',
                body: req.body,
                stack: error instanceof Error ? error.stack : undefined
            });
            return res.status(500).json({ error: 'Failed to sync user' });
        }
    },
};
//# sourceMappingURL=users.controller.js.map