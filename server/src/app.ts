import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import { connectRabbitMQ } from "./config/rabbitmq";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import scanRoutes from "./routes/scanRoutes";
import fileRoutes from "./routes/fileRoutes";
import healthRoutes from "./routes/healthRoutes";
import { FileController } from "./controllers/fileController";
import { ScanWorker } from "./workers/scanWorker";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/scans", scanRoutes);

// Direct route for GET /files as per requirements
app.get("/files", FileController.getAllFiles);

// Error handling middleware
app.use(errorHandler);

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info("Connected to MongoDB");

    // Try to connect to RabbitMQ, but don't fail if it doesn't work
    let rabbitMQConnected = false;
    try {
      await connectRabbitMQ();
      logger.info("Connected to RabbitMQ");
      rabbitMQConnected = true;
    } catch (error) {
      logger.warn(
        "Failed to connect to RabbitMQ, using synchronous processing:",
        error
      );
    }

    // Start scan worker only if RabbitMQ is connected
    if (rabbitMQConnected) {
      try {
        const scanWorker = ScanWorker.getInstance();
        await scanWorker.start();
        logger.info("Scan worker started");
      } catch (error) {
        logger.warn(
          "Failed to start scan worker, using synchronous processing:",
          error
        );
      }
    } else {
      logger.info("Using synchronous scan processing (no RabbitMQ)");
    }

    // Start the server regardless of RabbitMQ status
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info("API endpoints available:");
      logger.info(`- Health: http://localhost:${PORT}/api/health`);
      logger.info(`- Files: http://localhost:${PORT}/files`);
      logger.info(`- Upload: http://localhost:${PORT}/api/files/upload`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
