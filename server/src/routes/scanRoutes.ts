import { Router } from "express";
import { ScanController } from "../controllers/scanController";

const router = Router();

// Get all scans (for frontend compatibility)
router.get("/", ScanController.getAllScans);

// Get scan status for a specific file
router.get("/status/:id", ScanController.getScanStatus);

// Get scan history with pagination and filtering
router.get("/history", ScanController.getScanHistory);

// Get scan statistics
router.get("/stats", ScanController.getScanStats);

// Initiate scan for a file
router.post("/initiate/:id", ScanController.initiateScan);

// Rescan a file
router.post("/rescan/:id", ScanController.rescanFile);

export default router;
