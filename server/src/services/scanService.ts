import { FileService } from "./fileService";
import { MalwareScanner } from "../utils/scanner";
import { publishToQueue } from "../config/rabbitmq";
import { logger } from "../utils/logger";
import { createError } from "../middleware/errorHandler";

export class ScanService {
  public static async getAllScans(): Promise<any[]> {
    try {
      const result = await FileService.getAllFiles(1, 1000); // Get all scans

      const scans = result.files.map((file) => ({
        _id: file._id,
        originalName: file.originalName,
        filename: file.filename, // Keep filename for backward compatibility if needed, though originalName is preferred
        size: file.size,
        mimetype: file.mimetype,
        scanStatus: file.scanStatus,
        scanResult: file.scanResult,
        metadata: file.metadata,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      }));

      return scans;
    } catch (error) {
      logger.error("Error getting all scans:", error);
      throw createError("Failed to get all scans", 500);
    }
  }

  public static async uploadAndScanFile(
    file: Express.Multer.File
  ): Promise<any> {
    try {
      // Save file to database with "pending" status
      const savedFile = await FileService.uploadFile(file);
      logger.info(`File saved: ${savedFile._id}`);

      // Try to enqueue scan job to RabbitMQ for background processing
      try {
        await publishToQueue("scan-jobs", {
          fileId: savedFile._id as string,
          filename: savedFile.originalName,
          path: savedFile.path,
          mimetype: savedFile.mimetype,
        });
        logger.info(`Scan job enqueued for file: ${savedFile._id}`);
      } catch (error) {
        logger.warn(
          "RabbitMQ not available, processing scan synchronously:",
          error
        );
        // Fallback to synchronous processing
        await this.processScanJob(savedFile._id as string);
      }

      // Return the saved file
      return savedFile;
    } catch (error) {
      logger.error("Error in uploadAndScanFile:", error);
      throw createError("Failed to upload and scan file", 500);
    }
  }

  public static async processScanJob(fileId: string): Promise<void> {
    try {
      const file = await FileService.getFileById(fileId);
      if (!file) {
        throw createError("File not found", 404);
      }

      // Update status to scanning
      await FileService.updateFileStatus(fileId, "scanning");

      // Use the malware scanner (includes 2-5 second delay)
      const scanner = MalwareScanner.getInstance();
      const scanResult = await scanner.scanFile(
        file.path,
        file.originalName,
        file.mimetype
      );

      // Update file with scan results according to requirements
      const updatedFile = await FileService.updateFileStatus(
        fileId,
        "completed", // This will be mapped to "scanned" in the response
        {
          isMalicious: scanResult.isMalicious,
          confidence: scanResult.confidence,
          threats: scanResult.threats,
          scanTime: scanResult.scanTime,
          scannedAt: scanResult.scannedAt,
          status: scanResult.status, // "clean" or "infected"
          result: scanResult.status, // "clean" or "infected" as per requirements
        }
      );

      logger.info(`Scan completed for file: ${fileId} with status: ${scanResult.status}`);
    } catch (error) {
      logger.error("Error processing scan job:", error);

      // Update file status to failed
      await FileService.updateFileStatus(fileId, "failed");
      throw error;
    }
  }

  public static async getScanStatus(fileId: string): Promise<any> {
    try {
      const file = await FileService.getFileById(fileId);
      if (!file) {
        throw createError("File not found", 404);
      }

      return {
        status: file.scanStatus,
        result: file.scanResult,
      };
    } catch (error) {
      logger.error("Error getting scan status:", error);
      throw createError("Failed to get scan status", 500);
    }
  }

  public static async getScanHistory(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<any> {
    try {
      const result = await FileService.getAllFiles(page, limit);

      let files = result.files;

      // Filter by status if provided
      if (status && status !== "all") {
        files = files.filter((file) => file.scanStatus === status);
      }

      const scans = files.map((file) => ({
        _id: file._id,
        originalName: file.originalName,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        scanStatus: file.scanStatus,
        scanResult: file.scanResult,
        metadata: file.metadata,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      }));

      return {
        scans,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    } catch (error) {
      logger.error("Error getting scan history:", error);
      throw createError("Failed to get scan history", 500);
    }
  }

  public static async getScanStats(): Promise<any> {
    try {
      const result = await FileService.getAllFiles(1, 1000);
      const files = result.files;

      const stats = {
        total: files.length,
        clean: files.filter(
          (file) =>
            file.scanStatus === "completed" && !file.scanResult?.isMalicious
        ).length,
        infected: files.filter(
          (file) =>
            file.scanStatus === "completed" && file.scanResult?.isMalicious
        ).length,
        pending: files.filter(
          (file) =>
            file.scanStatus === "pending" || file.scanStatus === "scanning"
        ).length,
        failed: files.filter((file) => file.scanStatus === "failed").length,
      };

      return stats;
    } catch (error) {
      logger.error("Error getting scan stats:", error);
      throw createError("Failed to get scan stats", 500);
    }
  }

  public static async initiateScan(fileId: string): Promise<any> {
    try {
      const file = await FileService.getFileById(fileId);
      if (!file) {
        throw createError("File not found", 404);
      }

      // Try to enqueue scan job to RabbitMQ
      try {
        await publishToQueue("scan-jobs", {
          fileId: fileId,
          filename: file.originalName,
          path: file.path,
          mimetype: file.mimetype,
        });
        logger.info(`Scan job enqueued for file: ${fileId}`);
        return { message: "Scan job enqueued successfully" };
      } catch (error) {
        logger.warn(
          "RabbitMQ not available, processing scan synchronously:",
          error
        );
        // Fallback to synchronous processing
        await this.processScanJob(fileId);
        return { message: "Scan completed synchronously" };
      }
    } catch (error) {
      logger.error("Error initiating scan:", error);
      throw createError("Failed to initiate scan", 500);
    }
  }

  public static async rescanFile(fileId: string): Promise<any> {
    try {
      const file = await FileService.getFileById(fileId);
      if (!file) {
        throw createError("File not found", 404);
      }

      // Try to enqueue rescan job to RabbitMQ
      try {
        await publishToQueue("scan-jobs", {
          fileId: fileId,
          filename: file.originalName,
          path: file.path,
          mimetype: file.mimetype,
        });
        logger.info(`Rescan job enqueued for file: ${fileId}`);
        return { message: "Rescan job enqueued successfully" };
      } catch (error) {
        logger.warn(
          "RabbitMQ not available, processing rescan synchronously:",
          error
        );
        // Fallback to synchronous processing
        await this.processScanJob(fileId);
        return { message: "Rescan completed synchronously" };
      }
    } catch (error) {
      logger.error("Error rescanning file:", error);
      throw createError("Failed to rescan file", 500);
    }
  }
}
