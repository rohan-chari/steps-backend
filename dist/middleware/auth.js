"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalFirebaseAuth = exports.firebaseAuth = void 0;
const firebaseAdmin_1 = __importDefault(require("../adapters/firebaseAdmin"));
const logger_1 = require("../config/logger");
const firebaseAuth = async (req, res, next) => {
    try {
        // Get the ID token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger_1.logger.warn('No authorization header or invalid format', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path
            });
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No valid authorization header provided'
            });
        }
        const idToken = authHeader.split('Bearer ')[1];
        if (!idToken) {
            logger_1.logger.warn('No ID token provided', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path
            });
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No ID token provided'
            });
        }
        // Verify the ID token
        const decodedToken = await firebaseAdmin_1.default.auth().verifyIdToken(idToken);
        // Add user info to request object
        req.user = decodedToken;
        logger_1.logger.info('User authenticated successfully', {
            uid: decodedToken.uid,
            email: decodedToken.email,
            signInProvider: decodedToken.firebase?.sign_in_provider,
            path: req.path
        });
        next();
    }
    catch (error) {
        logger_1.logger.error('Firebase authentication failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path
        });
        // Handle specific Firebase auth errors
        if (error instanceof Error) {
            if (error.message.includes('expired')) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Token has expired'
                });
            }
            if (error.message.includes('invalid')) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid token'
                });
            }
        }
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication failed'
        });
    }
};
exports.firebaseAuth = firebaseAuth;
// Optional middleware for routes that can work with or without auth
const optionalFirebaseAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No auth header, continue without user
            return next();
        }
        const idToken = authHeader.split('Bearer ')[1];
        if (!idToken) {
            // No token, continue without user
            return next();
        }
        // Try to verify the token
        const decodedToken = await firebaseAdmin_1.default.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        logger_1.logger.info('Optional auth: User authenticated', {
            uid: decodedToken.uid,
            email: decodedToken.email,
            path: req.path
        });
        next();
    }
    catch (error) {
        // Auth failed, but continue without user (optional auth)
        logger_1.logger.warn('Optional auth: Authentication failed, continuing without user', {
            error: error instanceof Error ? error.message : 'Unknown error',
            path: req.path
        });
        next();
    }
};
exports.optionalFirebaseAuth = optionalFirebaseAuth;
//# sourceMappingURL=auth.js.map