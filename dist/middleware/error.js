"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.CustomError = void 0;
const logger_1 = require("../config/logger");
class CustomError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
const errorHandler = (error, req, res, next) => {
    const { statusCode = 500, message } = error;
    // Log error
    logger_1.logger.error('Error occurred', {
        error: message,
        statusCode,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    // Send error response
    res.status(statusCode).json({
        error: {
            message: statusCode === 500 ? 'Internal server error' : message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
        timestamp: new Date().toISOString()
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.js.map