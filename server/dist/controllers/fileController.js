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
exports.FileController = void 0;
const fileService_1 = require("../services/fileService");
const scanService_1 = require("../services/scanService");
const errorHandler_1 = require("../middleware/errorHandler");
class FileController {
    static uploadFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            fileService_1.upload.single("file")(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (err) {
                        if (err instanceof Error) {
                            throw (0, errorHandler_1.createError)(err.message, 400);
                        }
                        throw (0, errorHandler_1.createError)("File upload error", 400);
                    }
                    if (!req.file) {
                        throw (0, errorHandler_1.createError)("No file uploaded", 400);
                    }
                    // Save file to database
                    const fileRecord = yield fileService_1.FileService.uploadFile(req.file, req);
                    // Initiate scan
                    yield scanService_1.ScanService.initiateScan(fileRecord._id.toString());
                    res.status(201).json({
                        success: true,
                        message: "File uploaded and scan initiated successfully",
                        data: {
                            id: fileRecord._id,
                            originalName: fileRecord.originalName,
                            filename: fileRecord.filename,
                            size: fileRecord.size,
                            mimetype: fileRecord.mimetype,
                            scanStatus: fileRecord.scanStatus,
                            uploadedAt: fileRecord.metadata.uploadedAt,
                        },
                    });
                }
                catch (error) {
                    next(error);
                }
            }));
        });
    }
    static getFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const file = yield fileService_1.FileService.getFileById(id);
                if (!file) {
                    throw (0, errorHandler_1.createError)("File not found", 404);
                }
                res.status(200).json({
                    success: true,
                    data: {
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
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getAllFiles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const status = req.query.status;
                const result = yield fileService_1.FileService.getAllFiles(page, limit, status);
                res.status(200).json({
                    success: true,
                    data: {
                        files: result.files.map((file) => ({
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
                        })),
                        pagination: {
                            page: result.page,
                            limit,
                            total: result.total,
                            totalPages: result.totalPages,
                        },
                    },
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static deleteFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield fileService_1.FileService.deleteFile(id);
                res.status(200).json({
                    success: true,
                    message: "File deleted successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getFileStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield fileService_1.FileService.getFileStats();
                res.status(200).json({
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.FileController = FileController;
