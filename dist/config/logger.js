"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const env_1 = require("./env");
const isDevelopment = env_1.config.NODE_ENV === 'development';
exports.logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    transport: isDevelopment ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    } : undefined,
    formatters: {
        level: (label) => {
            return { level: label };
        }
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    base: {
        env: env_1.config.NODE_ENV,
        pid: process.pid
    }
});
//# sourceMappingURL=logger.js.map