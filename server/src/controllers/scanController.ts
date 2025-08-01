import { Request, Response, NextFunction } from "express";
import { ScanService } from "../services/scanService";
import { logger } from "../utils/logger";
import { createError } from "../middleware/errorHandler";

export class ScanController {
  public static async getAllScans(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const scans = await ScanService.getAllScans();

      res.status(200).json(scans);
    } catch (error) {
      next(error);
    }
  }

  public static async getScanStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const status = await ScanService.getScanStatus(id);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getScanHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await ScanService.getScanHistory(page, limit, status);

      res.status(200).json({
        success: true,
        data: {
          scans: result.scans,
          pagination: {
            page: result.page,
            limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getScanStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await ScanService.getScanStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async rescanFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await ScanService.rescanFile(id);

      res.status(200).json({
        success: true,
        message: "Rescan initiated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async initiateScan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await ScanService.initiateScan(id);

      res.status(200).json({
        success: true,
        message: "Scan initiated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
