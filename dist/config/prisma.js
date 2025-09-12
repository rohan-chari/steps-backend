"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
// Prevent multiple instances of Prisma Client in development
exports.prisma = globalThis.__prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
});
if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = exports.prisma;
}
// Database connection test
const connectDatabase = async () => {
    try {
        logger_1.logger.info('Attempting to connect to database...', {
            databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
            nodeEnv: process.env.NODE_ENV
        });
        await exports.prisma.$connect();
        logger_1.logger.info('Database connected successfully');
        // Test a simple query
        await exports.prisma.$queryRaw `SELECT 1 as test`;
        logger_1.logger.info('Database query test successful');
    }
    catch (error) {
        console.error('Database connection error details:', error);
        logger_1.logger.error('Failed to connect to database', {
            error: error instanceof Error ? error.message : 'Unknown error',
            code: error?.code,
            errno: error?.errno,
            syscall: error?.syscall,
            address: error?.address,
            port: error?.port,
            stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
// Graceful shutdown
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
});
// Handle process termination
process.on('SIGINT', async () => {
    await exports.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await exports.prisma.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=prisma.js.map