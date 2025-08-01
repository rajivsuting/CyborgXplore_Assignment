import { consumeFromQueue } from "../config/rabbitmq";
import { ScanService } from "../services/scanService";
import { logger } from "../utils/logger";

export class ScanWorker {
  private static instance: ScanWorker;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): ScanWorker {
    if (!ScanWorker.instance) {
      ScanWorker.instance = new ScanWorker();
    }
    return ScanWorker.instance;
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Scan worker is already running");
      return;
    }

    try {
      logger.info("Starting scan worker...");

      // Start consuming scan jobs
      await consumeFromQueue("scan-jobs", async (data) => {
        await this.processScanJob(data);
      });

      this.isRunning = true;
      logger.info("Scan worker started successfully");
    } catch (error) {
      logger.error("Failed to start scan worker:", error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn("Scan worker is not running");
      return;
    }

    try {
      logger.info("Stopping scan worker...");
      this.isRunning = false;
      logger.info("Scan worker stopped");
    } catch (error) {
      logger.error("Error stopping scan worker:", error);
    }
  }

  private async processScanJob(data: any): Promise<void> {
    const { fileId } = data;

    if (!fileId) {
      logger.error("Invalid scan job data: missing fileId");
      return;
    }

    try {
      logger.info(`Processing scan job for file: ${fileId}`);

      // Process the scan using the ScanService
      await ScanService.processScanJob(fileId);

      logger.info(`Scan job completed for file: ${fileId}`);
    } catch (error) {
      logger.error(`Error processing scan job for file ${fileId}:`, error);
      // The error is already handled in ScanService.processScanJob
      // which updates the file status to 'failed'
    }
  }

  public isWorkerRunning(): boolean {
    return this.isRunning;
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, stopping scan worker...");
  const worker = ScanWorker.getInstance();
  await worker.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, stopping scan worker...");
  const worker = ScanWorker.getInstance();
  await worker.stop();
  process.exit(0);
});

// Note: Worker is now started manually from app.ts instead of automatically
