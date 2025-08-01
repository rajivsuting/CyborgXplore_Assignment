"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const MONGODB_URI = process.env.MONGODB_URI ||
    "mongodb://admin:password123@localhost:27017/malware-scanner?authSource=admin";
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = yield mongoose_1.default.connect(MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
        });
        logger_1.logger.info(`MongoDB Connected: ${conn.connection.host}`);
        // Handle connection events
        mongoose_1.default.connection.on("error", (err) => {
            logger_1.logger.error("MongoDB connection error:", err);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            logger_1.logger.warn("MongoDB disconnected");
        });
        mongoose_1.default.connection.on("reconnected", () => {
            logger_1.logger.info("MongoDB reconnected");
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
const disconnectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.disconnect();
        logger_1.logger.info("MongoDB disconnected");
    }
    catch (error) {
        logger_1.logger.error("Error disconnecting from MongoDB:", error);
    }
});
exports.disconnectDB = disconnectDB;
