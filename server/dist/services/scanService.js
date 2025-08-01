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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanService = void 0;
const fileService_1 = require("./fileService");
const scanner_1 = require("../utils/scanner");
const rabbitmq_1 = require("../config/rabbitmq");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
class ScanService {
    static getAllScans() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield fileService_1.FileService.getAllFiles(1, 1000); // Get all scans
                const scans = result.files.map((file) => ({
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
                return scans;
            }
            catch (error) {
                logger_1.logger.error("Error getting all scans:", error);
                throw (0, errorHandler_1.createError)("Failed to get all scans", 500);
            }
        });
    }
    static initiateScan(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Update file status to scanning
                yield fileService_1.FileService.updateFileStatus(fileId, "scanning");
                // Publish scan job to queue
                yield (0, rabbitmq_1.publishToQueue)("scan-jobs", {
                    fileId,
                    timestamp: new Date().toISOString(),
                });
                logger_1.logger.info(`Scan initiated for file: ${fileId}`);
            }
            catch (error) {
                logger_1.logger.error("Error initiating scan:", error);
                throw (0, errorHandler_1.createError)("Failed to initiate scan", 500);
            }
        });
    }
    static processScanJob(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = yield fileService_1.FileService.getFileById(fileId);
                if (!file) {
                    throw new Error("File not found");
                }
                logger_1.logger.info(`Processing scan job for file: ${file.originalName}`);
                // Perform malware scan
                const scanner = scanner_1.MalwareScanner.getInstance();
                const scanResult = yield scanner.scanFile(file.path, file.originalName, file.mimetype);
                // Update file with scan results
                yield fileService_1.FileService.updateFileStatus(fileId, "completed", scanResult);
                // Publish scan result to results queue for real-time updates
                yield (0, rabbitmq_1.publishToQueue)("scan-results", {
                    fileId,
                    scanResult,
                    timestamp: new Date().toISOString(),
                });
                logger_1.logger.info(`Scan completed for file: ${file.originalName}`, {
                    isMalicious: scanResult.isMalicious,
                    confidence: scanResult.confidence,
                });
            }
            catch (error) {
                logger_1.logger.error("Error processing scan job:", error);
                // Update file status to failed
                yield fileService_1.FileService.updateFileStatus(fileId, "failed");
                throw error;
            }
        });
    }
    static getScanStatus(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = yield fileService_1.FileService.getFileById(fileId);
                if (!file) {
                    throw (0, errorHandler_1.createError)("File not found", 404);
                }
                let progress = 0;
                switch (file.scanStatus) {
                    case "pending":
                        progress = 0;
                        break;
                    case "scanning":
                        progress = 50;
                        break;
                    case "completed":
                    case "failed":
                        progress = 100;
                        break;
                }
                return {
                    status: file.scanStatus,
                    result: file.scanResult,
                    progress,
                };
            }
            catch (error) {
                logger_1.logger.error("Error getting scan status:", error);
                throw (0, errorHandler_1.createError)("Failed to get scan status", 500);
            }
        });
    }
    static getScanHistory() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, status) {
            try {
                const result = yield fileService_1.FileService.getAllFiles(page, limit, status);
                const scans = result.files.map((file) => ({
                    id: file._id,
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
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                };
            }
            catch (error) {
                logger_1.logger.error("Error getting scan history:", error);
                throw (0, errorHandler_1.createError)("Failed to get scan history", 500);
            }
        });
    }
    static getScanStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield fileService_1.FileService.getFileStats();
                // Calculate average scan time for completed scans
                const completedFiles = yield fileService_1.FileService.getAllFiles(1, 1000, "completed");
                const totalScanTime = completedFiles.files.reduce((sum, file) => {
                    var _a;
                    return sum + (((_a = file.scanResult) === null || _a === void 0 ? void 0 : _a.scanTime) || 0);
                }, 0);
                const averageScanTime = completedFiles.files.length > 0
                    ? totalScanTime / completedFiles.files.length
                    : 0;
                const scanSuccessRate = stats.total > 0
                    ? ((stats.completed + stats.failed) / stats.total) * 100
                    : 0;
                return {
                    totalScans: stats.total,
                    completedScans: stats.completed,
                    failedScans: stats.failed,
                    maliciousFiles: stats.malicious,
                    averageScanTime: Math.round(averageScanTime),
                    scanSuccessRate: Math.round(scanSuccessRate),
                };
            }
            catch (error) {
                logger_1.logger.error("Error getting scan stats:", error);
                throw (0, errorHandler_1.createError)("Failed to get scan stats", 500);
            }
        });
    }
    static rescanFile(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = yield fileService_1.FileService.getFileById(fileId);
                if (!file) {
                    throw (0, errorHandler_1.createError)("File not found", 404);
                }
                // Reset scan status and initiate new scan
                yield fileService_1.FileService.updateFileStatus(fileId, "pending");
                yield this.initiateScan(fileId);
                logger_1.logger.info(`Rescan initiated for file: ${file.originalName}`);
            }
            catch (error) {
                logger_1.logger.error("Error rescanning file:", error);
                throw (0, errorHandler_1.createError)("Failed to rescan file", 500);
            }
        });
    }
}
exports.ScanService = ScanService;
