"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseApp = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const logger_1 = require("../config/logger");
// Initialize Firebase Admin SDK
let firebaseApp;
try {
    // Check if Firebase is already initialized
    if (firebase_admin_1.default.apps.length === 0) {
        // Initialize with service account key from environment
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
        };
        exports.firebaseApp = firebaseApp = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
        logger_1.logger.info('Firebase Admin SDK initialized successfully');
    }
    else {
        exports.firebaseApp = firebaseApp = firebase_admin_1.default.app();
        logger_1.logger.info('Firebase Admin SDK already initialized');
    }
}
catch (error) {
    logger_1.logger.error('Failed to initialize Firebase Admin SDK', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
}
exports.default = firebase_admin_1.default;
//# sourceMappingURL=firebaseAdmin.js.map