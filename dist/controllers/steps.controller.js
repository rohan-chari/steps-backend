"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepsController = void 0;
const steps_repo_1 = require("../repos/steps.repo");
const users_repo_1 = require("../repos/users.repo");
const logger_1 = require("../config/logger");
exports.StepsController = {
    me: async (req, res) => {
        try {
            const firebaseUid = req.user?.uid;
            if (!firebaseUid) {
                logger_1.logger.warn('No Firebase UID found in request');
                return res.status(401).json({ error: 'Unauthorized - no user ID found' });
            }
            logger_1.logger.info('Fetching today\'s steps data', { firebaseUid });
            const user = await users_repo_1.UsersRepo.findByFirebaseUid(firebaseUid);
            if (!user) {
                logger_1.logger.warn('User not found when fetching steps', { firebaseUid });
                return res.status(404).json({ error: 'User not found in database' });
            }
            // Get today's date (date only, no time)
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            // Create date string in YYYY-MM-DD format for database comparison
            const todayDateString = today.toISOString().split('T')[0];
            logger_1.logger.info('User found, fetching today\'s steps', {
                userId: user.id,
                today: todayDateString
            });
            const todaySteps = await steps_repo_1.StepsRepo.findByUserIdAndDate(user.id, todayDateString);
            if (todaySteps) {
                logger_1.logger.info('Today\'s steps found', {
                    userId: user.id,
                    stepCount: todaySteps.stepCount,
                    stepDate: todaySteps.stepDate
                });
                const serializedStep = {
                    ...todaySteps,
                    id: todaySteps.id.toString()
                };
                return res.json(serializedStep);
            }
            else {
                logger_1.logger.info('No steps found for today, returning default', {
                    userId: user.id,
                    stepDate: todayDateString
                });
                // Return default step entry for today with 0 steps
                const defaultStep = {
                    id: null,
                    userId: user.id,
                    stepDate: todayDateString,
                    stepCount: 0,
                    sourceHint: null,
                    lastSyncedAt: new Date()
                };
                return res.json(defaultStep);
            }
        }
        catch (error) {
            logger_1.logger.error('Error fetching today\'s steps', {
                error: error instanceof Error ? error.message : 'Unknown error',
                firebaseUid: req.user?.uid,
                stack: error instanceof Error ? error.stack : undefined
            });
            return res.status(500).json({ error: 'Failed to fetch today\'s steps' });
        }
    },
};
//# sourceMappingURL=steps.controller.js.map