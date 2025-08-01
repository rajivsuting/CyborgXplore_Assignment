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
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const rabbitmq_1 = require("../config/rabbitmq");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Basic health check
router.get("/", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
    });
});
// Detailed health check with dependencies
router.get("/detailed", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const health = {
            status: "OK",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development",
            dependencies: {
                mongodb: "OK",
                rabbitmq: "OK",
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024),
            },
        };
        // Check MongoDB connection
        try {
            if (mongoose_1.default.connection.readyState !== 1) {
                health.dependencies.mongodb = "DISCONNECTED";
                health.status = "DEGRADED";
            }
        }
        catch (error) {
            health.dependencies.mongodb = "ERROR";
            health.status = "DEGRADED";
            logger_1.logger.error("MongoDB health check failed:", error);
        }
        // Check RabbitMQ connection
        try {
            const channel = (0, rabbitmq_1.getChannel)();
            if (!channel) {
                health.dependencies.rabbitmq = "DISCONNECTED";
                health.status = "DEGRADED";
            }
        }
        catch (error) {
            health.dependencies.rabbitmq = "ERROR";
            health.status = "DEGRADED";
            logger_1.logger.error("RabbitMQ health check failed:", error);
        }
        const statusCode = health.status === "OK" ? 200 : 503;
        res.status(statusCode).json(health);
    }
    catch (error) {
        logger_1.logger.error("Health check failed:", error);
        res.status(503).json({
            status: "ERROR",
            timestamp: new Date().toISOString(),
            error: "Health check failed",
        });
    }
}));
// Readiness probe
router.get("/ready", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if all dependencies are ready
        const mongoReady = mongoose_1.default.connection.readyState === 1;
        let rabbitReady = false;
        try {
            const channel = (0, rabbitmq_1.getChannel)();
            rabbitReady = !!channel;
        }
        catch (error) {
            // RabbitMQ not ready
        }
        if (mongoReady && rabbitReady) {
            res.status(200).json({
                status: "READY",
                timestamp: new Date().toISOString(),
            });
        }
        else {
            res.status(503).json({
                status: "NOT_READY",
                timestamp: new Date().toISOString(),
                dependencies: {
                    mongodb: mongoReady ? "READY" : "NOT_READY",
                    rabbitmq: rabbitReady ? "READY" : "NOT_READY",
                },
            });
        }
    }
    catch (error) {
        logger_1.logger.error("Readiness check failed:", error);
        res.status(503).json({
            status: "ERROR",
            timestamp: new Date().toISOString(),
            error: "Readiness check failed",
        });
    }
}));
// Liveness probe
router.get("/live", (req, res) => {
    res.status(200).json({
        status: "ALIVE",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
exports.default = router;
