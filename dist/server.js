"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./config/logger");
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const PORT = env_1.config.PORT || 3000;
// Initialize database connection and start server
const startServer = async () => {
    try {
        // Connect to database
        await (0, prisma_1.connectDatabase)();
        // Start server
        const server = app_1.default.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server running on port ${PORT}`, {
                environment: env_1.config.NODE_ENV,
                port: PORT,
                timestamp: new Date().toISOString()
            });
        });
        return server;
    }
    catch (error) {
        logger_1.logger.error('Failed to start server', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        process.exit(1);
    }
};
// Start the server
let server;
startServer().then((startedServer) => {
    server = startedServer;
    // Server started successfully
}).catch((error) => {
    logger_1.logger.error('Failed to start server', {
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    if (server) {
        server.close(() => {
            logger_1.logger.info('Process terminated');
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    if (server) {
        server.close(() => {
            logger_1.logger.info('Process terminated');
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
exports.default = server;
//# sourceMappingURL=server.js.map