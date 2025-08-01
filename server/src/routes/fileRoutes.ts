import { Router } from "express";
import { FileController } from "../controllers/fileController";
import { upload } from "../services/fileService";

const router = Router();

// Upload file with multer middleware
router.post("/upload", upload.single("file"), FileController.uploadFile);

// Get all files with pagination and filtering
router.get("/", FileController.getAllFiles);

// Get file by ID
router.get("/:id", FileController.getFileById);

// Delete file
router.delete("/:id", FileController.deleteFile);

export default router;
