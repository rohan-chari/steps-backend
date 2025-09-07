import app from './app';
import { logger } from './config/logger';
import { config } from './config/env';
import { connectDatabase } from './config/prisma';

const PORT = config.PORT || 3000;

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`, {
        environment: config.NODE_ENV,
        port: PORT,
        timestamp: new Date().toISOString()
      });
    });
    
    return server;
  } catch (error) {
    logger.error('Failed to start server', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    process.exit(1);
  }
};

// Start the server
let server: any;

startServer().then((startedServer) => {
  server = startedServer;
  // Server started successfully
}).catch((error) => {
  logger.error('Failed to start server', { 
    error: error instanceof Error ? error.message : 'Unknown error' 
  });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;
