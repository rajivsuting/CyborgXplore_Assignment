"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileController_1 = require("../controllers/fileController");
const router = (0, express_1.Router)();
// Upload file
router.post("/upload", fileController_1.FileController.uploadFile);
// Get file statistics (must come before /:id routes)
router.get("/stats/overview", fileController_1.FileController.getFileStats);
// Get all files with pagination and filtering
router.get("/", fileController_1.FileController.getAllFiles);
// Get file by ID
router.get("/:id", fileController_1.FileController.getFile);
// Delete file
router.delete("/:id", fileController_1.FileController.deleteFile);
exports.default = router;
