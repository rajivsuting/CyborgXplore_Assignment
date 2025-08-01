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
exports.ScanWorker = void 0;
const rabbitmq_1 = require("../config/rabbitmq");
const scanService_1 = require("../services/scanService");
const logger_1 = require("../utils/logger");
class ScanWorker {
    constructor() {
        this.isRunning = false;
    }
    static getInstance() {
        if (!ScanWorker.instance) {
            ScanWorker.instance = new ScanWorker();
        }
        return ScanWorker.instance;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRunning) {
                logger_1.logger.warn("Scan worker is already running");
                return;
            }
            try {
                logger_1.logger.info("Starting scan worker...");
                // Start consuming scan jobs
                yield (0, rabbitmq_1.consumeFromQueue)("scan-jobs", (data) => __awaiter(this, void 0, void 0, function* () {
                    yield this.processScanJob(data);
                }));
                this.isRunning = true;
                logger_1.logger.info("Scan worker started successfully");
            }
            catch (error) {
                logger_1.logger.error("Failed to start scan worker:", error);
                throw error;
            }
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRunning) {
                logger_1.logger.warn("Scan worker is not running");
                return;
            }
            try {
                logger_1.logger.info("Stopping scan worker...");
                this.isRunning = false;
                logger_1.logger.info("Scan worker stopped");
            }
            catch (error) {
                logger_1.logger.error("Error stopping scan worker:", error);
            }
        });
    }
    processScanJob(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fileId } = data;
            if (!fileId) {
                logger_1.logger.error("Invalid scan job data: missing fileId");
                return;
            }
            try {
                logger_1.logger.info(`Processing scan job for file: ${fileId}`);
                // Process the scan
                yield scanService_1.ScanService.processScanJob(fileId);
                logger_1.logger.info(`Scan job completed for file: ${fileId}`);
            }
            catch (error) {
                logger_1.logger.error(`Error processing scan job for file ${fileId}:`, error);
                // The error is already handled in ScanService.processScanJob
                // which updates the file status to 'failed'
            }
        });
    }
    isWorkerRunning() {
        return this.isRunning;
    }
}
exports.ScanWorker = ScanWorker;
// Start the worker when this module is imported
const worker = ScanWorker.getInstance();
// Handle graceful shutdown
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info("SIGTERM received, stopping scan worker...");
    yield worker.stop();
    process.exit(0);
}));
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info("SIGINT received, stopping scan worker...");
    yield worker.stop();
    process.exit(0);
}));
// Start the worker
worker.start().catch((error) => {
    logger_1.logger.error("Failed to start scan worker:", error);
    process.exit(1);
});
