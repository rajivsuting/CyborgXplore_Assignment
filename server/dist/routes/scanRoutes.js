"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scanController_1 = require("../controllers/scanController");
const router = (0, express_1.Router)();
// Get all scans (for frontend compatibility)
router.get("/", scanController_1.ScanController.getAllScans);
// Get scan status for a specific file
router.get("/status/:id", scanController_1.ScanController.getScanStatus);
// Get scan history with pagination and filtering
router.get("/history", scanController_1.ScanController.getScanHistory);
// Get scan statistics
router.get("/stats", scanController_1.ScanController.getScanStats);
// Initiate scan for a file
router.post("/initiate/:id", scanController_1.ScanController.initiateScan);
// Rescan a file
router.post("/rescan/:id", scanController_1.ScanController.rescanFile);
exports.default = router;
