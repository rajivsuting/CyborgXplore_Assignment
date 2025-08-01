import mongoose, { Document, Schema } from "mongoose";

export interface IFile extends Document {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  scanStatus: "pending" | "scanning" | "completed" | "failed";
  scanResult?: {
    isMalicious: boolean;
    confidence: number;
    threats: string[];
    scanTime: number;
    scannedAt: Date;
  };
  metadata: {
    uploadedAt: Date;
    uploadedBy?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
FileSchema.index({ scanStatus: 1, createdAt: -1 });
FileSchema.index({ "scanResult.isMalicious": 1 });
FileSchema.index({ filename: 1 });

// Virtual for file extension
FileSchema.virtual("extension").get(function () {
  return this.originalName.split(".").pop()?.toLowerCase();
});

// Virtual for formatted file size
FileSchema.virtual("formattedSize").get(function () {
  const bytes = this.size;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
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

export const File = mongoose.model<IFile>("File", FileSchema);
