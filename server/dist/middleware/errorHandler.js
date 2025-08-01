"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    let error = Object.assign({}, err);
    error.message = err.message;
    // Log error
    logger_1.logger.error("Error occurred:", {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
    });
    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        const message = "Resource not found";
        error = Object.assign(Object.assign({}, error), { message, statusCode: 404 });
    }
    // Mongoose duplicate key
    if (err.name === "MongoError" && err.code === 11000) {
        const message = "Duplicate field value entered";
        error = Object.assign(Object.assign({}, error), { message, statusCode: 400 });
    }
    // Mongoose validation error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        error = Object.assign(Object.assign({}, error), { message, statusCode: 400 });
    }
    // Multer errors
    if (err.name === "MulterError") {
        let message = "File upload error";
        let statusCode = 400;
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                message = "File too large";
                break;
            case "LIMIT_FILE_COUNT":
                message = "Too many files";
                break;
            case "LIMIT_UNEXPECTED_FILE":
                message = "Unexpected file field";
                break;
            default:
                message = "File upload error";
        }
        error = Object.assign(Object.assign({}, error), { message, statusCode });
    }
    // JWT errors
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid token";
        error = Object.assign(Object.assign({}, error), { message, statusCode: 401 });
    }
    if (err.name === "TokenExpiredError") {
        const message = "Token expired";
        error = Object.assign(Object.assign({}, error), { message, statusCode: 401 });
    }
    res.status(error.statusCode || 500).json(Object.assign({ success: false, error: error.message || "Server Error" }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
