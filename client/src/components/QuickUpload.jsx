import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useScan } from "../context/ScanContext";

function QuickUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const { uploadAndScan } = useScan();

  const onDrop = useCallback(async (acceptedFiles) => {
    console.log("File dropped:", acceptedFiles);
    if (acceptedFiles.length > 0) {
      await handleFileUpload(acceptedFiles[0]);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB as per backend requirements
  });

  const handleFileUpload = async (file) => {
    try {
      console.log("Starting file upload:", file.name);
      setUploading(true);
      const result = await uploadAndScan(file);
      console.log("Upload result:", result);
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getDropzoneClasses = () => {
    let baseClasses =
      "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200";

    if (isDragReject) {
      return `${baseClasses} border-red-500 bg-red-500/10`;
    } else if (isDragAccept) {
      return `${baseClasses} border-green-500 bg-green-500/10`;
    } else if (isDragActive) {
      return `${baseClasses} border-purple-500 bg-purple-500/10`;
    } else {
      return `${baseClasses} border-slate-600 hover:border-slate-500`;
    }
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={getDropzoneClasses()}>
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            ) : (
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>
          <div>
            <p
              className={`font-medium ${
                uploading
                  ? "text-2xl text-purple-400 font-bold"
                  : "text-lg text-white"
              }`}
            >
              {uploading
                ? "Uploading..."
                : isDragActive
                ? isDragReject
                  ? "File type not supported"
                  : "Drop the file here"
                : "Drop files here or click to browse"}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Supports: .pdf, .docx, .jpg, .png (Max: 5MB)
            </p>
          </div>
          {uploading && (
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full animate-pulse"></div>
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Choose File
            </button>
          )}
        </div>
      </div>
      {/* File type restrictions info (always visible) */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-2">
          Supported File Types:
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div>• PDF files (.pdf)</div>
          <div>• Word documents (.docx)</div>
          <div>• JPEG images (.jpg, .jpeg)</div>
          <div>• PNG images (.png)</div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Maximum file size: 5MB</p>
      </div>
    </div>
  );
}

export default QuickUpload;
