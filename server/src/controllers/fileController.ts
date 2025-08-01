import { Request, Response, NextFunction } from "express";
import { FileService } from "../services/fileService";
import { ScanService } from "../services/scanService";
import { logger } from "../utils/logger";
import { createError } from "../middleware/errorHandler";

export class FileController {
  public static async uploadFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        throw createError("No file uploaded", 400);
      }

      // Use the new synchronous scan service
      const scanResult = await ScanService.uploadAndScanFile(req.file);

      res.status(201).json({
        success: true,
        message: "File uploaded and scanned successfully",
        data: scanResult,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getAllFiles(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await FileService.getAllFiles(page, limit, status);

      const files = result.files.map((file) => ({
        id: file._id,
        filename: file.originalName,
        path: file.path,
        status: file.scanStatus === "completed" ? "scanned" : file.scanStatus, // Map "completed" to "scanned"
        uploadedAt: file.metadata?.uploadedAt,
        scannedAt: file.scanResult?.scannedAt,
        result: file.scanResult?.result || (file.scanResult?.isMalicious ? "infected" : "clean"), // Use new result field or fallback
        size: file.size,
        mimetype: file.mimetype,
      }));

      res.status(200).json({
        success: true,
        data: {
          files,
          pagination: {
            page: result.page,
            limit: result.totalPages,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getFileById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const file = await FileService.getFileById(id);

      if (!file) {
        throw createError("File not found", 404);
      }

      const fileData = {
        id: file._id,
        filename: file.originalName,
        path: file.path,
        status: file.scanStatus === "completed" ? "scanned" : file.scanStatus, // Map "completed" to "scanned"
        uploadedAt: file.metadata?.uploadedAt,
        scannedAt: file.scanResult?.scannedAt,
        result: file.scanResult?.result || (file.scanResult?.isMalicious ? "infected" : "clean"), // Use new result field or fallback
        size: file.size,
        mimetype: file.mimetype,
        scanResult: file.scanResult,
      };

      res.status(200).json({
        success: true,
        data: fileData,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await FileService.deleteFile(id);

      res.status(200).json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
