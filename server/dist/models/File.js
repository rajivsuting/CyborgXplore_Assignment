"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FileSchema = new mongoose_1.Schema({
    originalName: {
        type: String,
        required: [true, "Original filename is required"],
        trim: true,
    },
    filename: {
        type: String,
        required: [true, "Generated filename is required"],
    },
    mimetype: {
        type: String,
        required: [true, "MIME type is required"],
    },
    size: {
        type: Number,
        required: [true, "File size is required"],
        min: [1, "File size must be greater than 0"],
    },
    path: {
        type: String,
        required: [true, "File path is required"],
    },
    scanStatus: {
        type: String,
        enum: ["pending", "scanning", "completed", "failed"],
        default: "pending",
        required: true,
    },
    scanResult: {
        isMalicious: {
            type: Boolean,
            default: false,
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        threats: [
            {
                type: String,
                trim: true,
            },
        ],
        scanTime: {
            type: Number,
            min: 0,
            default: 0,
        },
        scannedAt: {
            type: Date,
        },
    },
    metadata: {
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
        uploadedBy: {
            type: String,
            trim: true,
        },
        ipAddress: {
            type: String,
            trim: true,
        },
        userAgent: {
            type: String,
            trim: true,
        },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes for better query performance
FileSchema.index({ scanStatus: 1, createdAt: -1 });
FileSchema.index({ "scanResult.isMalicious": 1 });
FileSchema.index({ filename: 1 });
// Virtual for file extension
FileSchema.virtual("extension").get(function () {
    var _a;
    return (_a = this.originalName.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
});
// Virtual for formatted file size
FileSchema.virtual("formattedSize").get(function () {
    const bytes = this.size;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0)
        return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
});
// Pre-save middleware to validate file size
FileSchema.pre("save", function (next) {
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (this.size > maxSize) {
        return next(new Error("File size exceeds maximum allowed size of 100MB"));
    }
    next();
});
exports.File = mongoose_1.default.model("File", FileSchema);
