import { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { File, IFile } from "../models/File";
import { logger } from "../utils/logger";
import { createError } from "../middleware/errorHandler";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed file types as per requirements: .pdf, .docx, .jpg, .png
  const allowedMimeTypes = [
    "application/pdf", // .pdf
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "image/jpeg", // .jpg
    "image/png", // .png
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type ${file.mimetype} is not allowed. Only .pdf, .docx, .jpg, .png files are accepted.`
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB as per requirements
    files: 1,
  },
});

export class FileService {
  public static async uploadFile(
    file: Express.Multer.File,
    req?: Request // Make req optional as it's not always passed when called internally
  ): Promise<IFile> {
    try {
      // Create file record in database
      const fileRecord = new File({
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        scanStatus: "pending",
        metadata: {
          uploadedAt: new Date(),
          ipAddress: req?.ip, // Use optional chaining
          userAgent: req?.get("User-Agent"), // Use optional chaining
        },
      });

      await fileRecord.save();
      logger.info(`File uploaded successfully: ${file.originalname}`);

      return fileRecord;
    } catch (error) {
      logger.error("Error uploading file:", error);
      throw createError("Failed to upload file", 500);
    }
  }

  public static async getFileById(id: string): Promise<IFile | null> {
    try {
      const file = await File.findById(id);
      return file;
    } catch (error) {
      logger.error(`Error getting file by ID ${id}:`, error);
      throw createError("Failed to get file", 500);
    }
  }

  public static async getAllFiles(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{
    files: IFile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const query: any = {};
      if (status) {
        query.scanStatus = status;
      }

      const total = await File.countDocuments(query);
      const files = await File.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        files,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Error getting all files:", error);
      throw createError("Failed to get files", 500);
    }
  }

  public static async updateFileStatus(
    id: string,
    status: "pending" | "scanning" | "completed" | "failed",
    scanResult?: any
  ): Promise<IFile | null> {
    try {
      const updatedFile = await File.findByIdAndUpdate(
        id,
        { scanStatus: status, scanResult: scanResult, updatedAt: new Date() },
        { new: true }
      );
      if (!updatedFile) {
        throw createError("File not found for update", 404);
      }
      logger.info(`File status updated to ${status} for ID: ${id}`);
      return updatedFile;
    } catch (error) {
      logger.error(`Error updating file status for ID ${id}:`, error);
      throw createError("Failed to update file status", 500);
    }
  }

  public static async deleteFile(id: string): Promise<void> {
    try {
      const file = await File.findByIdAndDelete(id);
      if (!file) {
        throw createError("File not found for deletion", 404);
      }
      // Optionally, delete the physical file from the uploads directory
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        logger.info(`Physical file deleted: ${file.path}`);
      }
      logger.info(`File deleted successfully: ${id}`);
    } catch (error) {
      logger.error(`Error deleting file ${id}:`, error);
      throw createError("Failed to delete file", 500);
    }
  }

  public static async getFileStats(): Promise<{
    total: number;
    pending: number;
    scanning: number;
    completed: number;
    failed: number;
    malicious: number;
  }> {
    try {
      const total = await File.countDocuments();
      const pending = await File.countDocuments({ scanStatus: "pending" });
      const scanning = await File.countDocuments({ scanStatus: "scanning" });
      const completed = await File.countDocuments({ scanStatus: "completed" });
      const failed = await File.countDocuments({ scanStatus: "failed" });
      const malicious = await File.countDocuments({
        scanStatus: "completed",
        "scanResult.isMalicious": true,
      });

      return {
        total,
        pending,
        scanning,
        completed,
        failed,
        malicious,
      };
    } catch (error) {
      logger.error("Error getting file stats:", error);
      throw createError("Failed to get file stats", 500);
    }
  }
}
