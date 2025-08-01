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
exports.FileService = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const File_1 = require("../models/File");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(__dirname, "../../uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedMimeTypes = [
        "text/plain",
        "text/html",
        "text/css",
        "text/javascript",
        "application/javascript",
        "application/json",
        "application/xml",
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        "application/zip",
        "application/x-zip-compressed",
        "application/x-rar-compressed",
        "application/x-msdownload",
        "application/x-executable",
        "application/x-msi",
        "application/x-msdos-program",
        "application/x-msdos-windows",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        files: 1,
    },
});
class FileService {
    static uploadFile(file, req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Create file record in database
                const fileRecord = new File_1.File({
                    originalName: file.originalname,
                    filename: file.filename,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    scanStatus: "pending",
                    metadata: {
                        uploadedAt: new Date(),
                        ipAddress: req.ip,
                        userAgent: req.get("User-Agent"),
                    },
                });
                yield fileRecord.save();
                logger_1.logger.info(`File uploaded successfully: ${file.originalname}`);
                return fileRecord;
            }
            catch (error) {
                logger_1.logger.error("Error uploading file:", error);
                throw (0, errorHandler_1.createError)("Failed to upload file", 500);
            }
        });
    }
    static getFileById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield File_1.File.findById(id);
            }
            catch (error) {
                logger_1.logger.error("Error getting file by ID:", error);
                throw (0, errorHandler_1.createError)("Failed to get file", 500);
            }
        });
    }
    static getAllFiles() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, status) {
            try {
                const skip = (page - 1) * limit;
                const filter = {};
                if (status) {
                    filter.scanStatus = status;
                }
                const [files, total] = yield Promise.all([
                    File_1.File.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
                    File_1.File.countDocuments(filter),
                ]);
                return {
                    files,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                };
            }
            catch (error) {
                logger_1.logger.error("Error getting all files:", error);
                throw (0, errorHandler_1.createError)("Failed to get files", 500);
            }
        });
    }
    static updateFileStatus(id, status, scanResult) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateData = { scanStatus: status };
                if (scanResult) {
                    updateData.scanResult = scanResult;
                }
                return yield File_1.File.findByIdAndUpdate(id, updateData, { new: true });
            }
            catch (error) {
                logger_1.logger.error("Error updating file status:", error);
                throw (0, errorHandler_1.createError)("Failed to update file status", 500);
            }
        });
    }
    static deleteFile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = yield File_1.File.findById(id);
                if (!file) {
                    throw (0, errorHandler_1.createError)("File not found", 404);
                }
                // Delete physical file
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
                // Delete from database
                yield File_1.File.findByIdAndDelete(id);
                logger_1.logger.info(`File deleted successfully: ${file.originalName}`);
            }
            catch (error) {
                logger_1.logger.error("Error deleting file:", error);
                throw (0, errorHandler_1.createError)("Failed to delete file", 500);
            }
        });
    }
    static getFileStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [total, pending, scanning, completed, failed, malicious] = yield Promise.all([
                    File_1.File.countDocuments(),
                    File_1.File.countDocuments({ scanStatus: "pending" }),
                    File_1.File.countDocuments({ scanStatus: "scanning" }),
                    File_1.File.countDocuments({ scanStatus: "completed" }),
                    File_1.File.countDocuments({ scanStatus: "failed" }),
                    File_1.File.countDocuments({ "scanResult.isMalicious": true }),
                ]);
                return {
                    total,
                    pending,
                    scanning,
                    completed,
                    failed,
                    malicious,
                };
            }
            catch (error) {
                logger_1.logger.error("Error getting file stats:", error);
                throw (0, errorHandler_1.createError)("Failed to get file stats", 500);
            }
        });
    }
}
exports.FileService = FileService;
