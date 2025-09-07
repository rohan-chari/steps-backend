import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug environment loading
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
  PORT: process.env.PORT
});

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Firebase
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
} as const;

// Validate required environment variables in production
if (config.NODE_ENV === 'production') {
  const requiredEnvVars = ['DATABASE_URL', 'FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
