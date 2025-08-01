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
exports.ScanController = void 0;
const scanService_1 = require("../services/scanService");
class ScanController {
    static getAllScans(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scans = yield scanService_1.ScanService.getAllScans();
                res.status(200).json(scans);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getScanStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const status = yield scanService_1.ScanService.getScanStatus(id);
                res.status(200).json({
                    success: true,
                    data: status,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getScanHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const status = req.query.status;
                const result = yield scanService_1.ScanService.getScanHistory(page, limit, status);
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
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getScanStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield scanService_1.ScanService.getScanStats();
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
    static rescanFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield scanService_1.ScanService.rescanFile(id);
                res.status(200).json({
                    success: true,
                    message: "Rescan initiated successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static initiateScan(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield scanService_1.ScanService.initiateScan(id);
                res.status(200).json({
                    success: true,
                    message: "Scan initiated successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ScanController = ScanController;
