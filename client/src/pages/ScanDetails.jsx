import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useScan } from "../context/ScanContext";

function ScanDetails() {
  const { id } = useParams();
  const { currentScan, getScanDetails, loading } = useScan();

  useEffect(() => {
    if (id) {
      getScanDetails(id);
    }
  }, [id, getScanDetails]);

  const getStatusColor = (scanStatus, scanResult) => {
    if (scanStatus === "completed") {
      return scanResult?.isMalicious ? "bg-red-500" : "bg-green-500";
    } else if (scanStatus === "scanning" || scanStatus === "pending") {
      return "bg-yellow-500";
    } else if (scanStatus === "failed") {
      return "bg-red-500";
    }
    return "bg-slate-500";
  };

  const getStatusText = (scanStatus, scanResult) => {
    if (scanStatus === "completed") {
      return scanResult?.isMalicious ? "Infected" : "Clean";
    } else if (scanStatus === "scanning") {
      return "Scanning";
    } else if (scanStatus === "pending") {
      return "Pending";
    } else if (scanStatus === "failed") {
      return "Failed";
    }
    return "Unknown";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!currentScan) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">Scan not found</div>
        <Link
          to="/history"
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Scan Details</h1>
          <p className="text-slate-300">
            Detailed analysis of {currentScan.originalName}
          </p>
        </div>
        <Link
          to="/history"
          className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600"
        >
          ← Back to History
        </Link>
      </div>

      {/* Status Banner */}
      <div
        className={`rounded-xl p-6 ${
          currentScan.scanStatus === "completed" &&
          !currentScan.scanResult?.isMalicious
            ? "bg-green-500/20 border border-green-500/30"
            : currentScan.scanStatus === "completed" &&
              currentScan.scanResult?.isMalicious
            ? "bg-red-500/20 border border-red-500/30"
            : "bg-yellow-500/20 border border-yellow-500/30"
        }`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-4 h-4 rounded-full ${getStatusColor(
              currentScan.scanStatus,
              currentScan.scanResult
            )}`}
          ></div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {getStatusText(currentScan.scanStatus, currentScan.scanResult)}
            </h2>
            <p className="text-slate-300">
              {currentScan.scanStatus === "completed"
                ? currentScan.scanResult?.isMalicious
                  ? "This file contains malicious content"
                  : "This file is safe and clean"
                : currentScan.scanStatus === "scanning"
                ? "Scanning in progress..."
                : currentScan.scanStatus === "pending"
                ? "Scan pending..."
                : "Scan failed"}
            </p>
          </div>
        </div>
      </div>

      {/* File Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            File Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Filename:</span>
              <span className="text-white font-medium">
                {currentScan.originalName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">File Size:</span>
              <span className="text-white">
                {formatFileSize(currentScan.fileSize || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Upload Date:</span>
              <span className="text-white">
                {formatDate(currentScan.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Scan Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentScan.scanStatus === "completed" &&
                  !currentScan.scanResult?.isMalicious
                    ? "bg-green-500/20 text-green-400"
                    : currentScan.scanStatus === "completed" &&
                      currentScan.scanResult?.isMalicious
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {getStatusText(currentScan.scanStatus, currentScan.scanResult)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            Scan Results
          </h3>
          {currentScan.scanStatus === "pending" ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-slate-300">Scanning in progress...</p>
            </div>
          ) : currentScan.scanResult ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Threats Detected:</span>
                <span className="text-white">
                  {currentScan.scanResult.threats?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scan Duration:</span>
                <span className="text-white">
                  {currentScan.scanResult.duration || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scanner Used:</span>
                <span className="text-white">
                  {currentScan.scanResult.scanner || "Advanced Scanner"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No detailed results available</p>
          )}
        </div>
      </div>

      {/* Threat Details */}
      {currentScan.scanStatus === "completed" &&
        currentScan.scanResult?.threats && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Threat Details
            </h3>
            <div className="space-y-4">
              {currentScan.scanResult.threats.map((threat, index) => (
                <div
                  key={index}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-red-400 font-medium">
                      {threat.name}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">{threat.description}</p>
                  {threat.severity && (
                    <div className="mt-2">
                      <span className="text-xs text-slate-400">Severity: </span>
                      <span className="text-red-400 text-xs font-medium">
                        {threat.severity}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Security Recommendations */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          Security Recommendations
        </h3>
        <div className="space-y-3">
          {currentScan.scanStatus === "completed" &&
            !currentScan.scanResult?.isMalicious && (
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">File is safe to use</p>
                  <p className="text-slate-400 text-sm">
                    This file has been scanned and appears to be free from
                    malware.
                  </p>
                </div>
              </div>
            )}
          {currentScan.scanStatus === "completed" &&
            currentScan.scanResult?.isMalicious && (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Do not open this file
                    </p>
                    <p className="text-slate-400 text-sm">
                      This file contains potential security threats and should
                      not be executed.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Update your antivirus
                    </p>
                    <p className="text-slate-400 text-sm">
                      Ensure your antivirus software is up to date for better
                      protection.
                    </p>
                  </div>
                </div>
              </>
            )}
          {currentScan.scanStatus === "pending" && (
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                <svg
                  className="w-4 h-4 text-white animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Scan in progress</p>
                <p className="text-slate-400 text-sm">
                  Please wait while we analyze the file for potential threats.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScanDetails;
