import React from "react";
import { Link } from "react-router-dom";

function RecentScans({ scans }) {
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

  const formatFileName = (name) => {
    if (!name) return "";
    if (name.length > 30) {
      return name.slice(0, 30) + "...";
    }
    return name;
  };

  if (scans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">
          No scans yet. Upload a file to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scans.map((scan) => (
        <Link
          key={scan._id}
          to={`/scan/${scan._id}`}
          className="block bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(
                    scan.scanStatus,
                    scan.scanResult
                  )}`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {formatFileName(scan.originalName)}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {formatDate(scan.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scan.scanStatus === "completed" &&
                  !scan.scanResult?.isMalicious
                    ? "bg-green-500/20 text-green-400"
                    : scan.scanStatus === "completed" &&
                      scan.scanResult?.isMalicious
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {getStatusText(scan.scanStatus, scan.scanResult)}
              </span>
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default RecentScans;
