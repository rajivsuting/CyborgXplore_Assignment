import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { getChannel } from "../config/rabbitmq";
import { logger } from "../utils/logger";

const router = Router();

// Basic health check
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Detailed health check with dependencies
router.get("/detailed", async (req: Request, res: Response) => {
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
      if (mongoose.connection.readyState !== 1) {
        health.dependencies.mongodb = "DISCONNECTED";
        health.status = "DEGRADED";
      }
    } catch (error) {
      health.dependencies.mongodb = "ERROR";
      health.status = "DEGRADED";
      logger.error("MongoDB health check failed:", error);
    }

    // Check RabbitMQ connection
    try {
      const channel = getChannel();
      if (!channel) {
        health.dependencies.rabbitmq = "DISCONNECTED";
        health.status = "DEGRADED";
      }
    } catch (error) {
      health.dependencies.rabbitmq = "ERROR";
      health.status = "DEGRADED";
      logger.error("RabbitMQ health check failed:", error);
    }

    const statusCode = health.status === "OK" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
});

// Readiness probe
router.get("/ready", async (req: Request, res: Response) => {
  try {
    // Check if all dependencies are ready
    const mongoReady = mongoose.connection.readyState === 1;
    let rabbitReady = false;

    try {
      const channel = getChannel();
      rabbitReady = !!channel;
    } catch (error) {
      // RabbitMQ not ready
    }

    if (mongoReady && rabbitReady) {
      res.status(200).json({
        status: "READY",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: "NOT_READY",
        timestamp: new Date().toISOString(),
        dependencies: {
          mongodb: mongoReady ? "READY" : "NOT_READY",
          rabbitmq: rabbitReady ? "READY" : "NOT_READY",
        },
      });
    }
  } catch (error) {
    logger.error("Readiness check failed:", error);
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: "Readiness check failed",
    });
  }
});

// Liveness probe
router.get("/live", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ALIVE",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
