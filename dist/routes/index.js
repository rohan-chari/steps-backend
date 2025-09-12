"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const error_1 = require("../middleware/error");
const users_routes_1 = __importDefault(require("./users.routes"));
const steps_routes_1 = __importDefault(require("./steps.routes"));
const router = (0, express_1.Router)();
// Mount route modules
router.use('/users', users_routes_1.default);
router.use('/steps', steps_routes_1.default);
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Database health check endpoint
router.get('/db-health', (0, error_1.asyncHandler)(async (req, res) => {
    try {
        // Test database connection
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'OK',
            database: 'Connected',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'ERROR',
            database: 'Disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
}));
// API info endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Steps App API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            dbHealth: '/api/db-health',
            users: '/api/users/me',
            userSync: '/api/users/sync',
            steps: '/api/steps/me/today'
        },
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map