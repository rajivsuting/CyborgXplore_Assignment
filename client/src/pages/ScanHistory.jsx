import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useScan } from "../context/ScanContext";

function ScanHistory() {
  const { scans, loading } = useScan();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredScans = scans.filter((scan) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "clean" &&
        scan.scanStatus === "completed" &&
        !scan.scanResult?.isMalicious) ||
      (filter === "infected" &&
        scan.scanStatus === "completed" &&
        scan.scanResult?.isMalicious) ||
      (filter === "pending" &&
        (scan.scanStatus === "pending" || scan.scanStatus === "scanning"));
    const matchesSearch = scan.originalName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Scan History</h1>
        <p className="text-slate-300 text-lg">
          View all your file scans and their results
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              All ({scans.length})
            </button>
            <button
              onClick={() => setFilter("clean")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "clean"
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Clean (
              {
                scans.filter(
                  (s) =>
                    s.scanStatus === "completed" && !s.scanResult?.isMalicious
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilter("infected")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "infected"
                  ? "bg-red-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Infected (
              {
                scans.filter(
                  (s) =>
                    s.scanStatus === "completed" && s.scanResult?.isMalicious
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Pending (
              {
                scans.filter(
                  (s) =>
                    s.scanStatus === "pending" || s.scanStatus === "scanning"
                ).length
              }
              )
            </button>
          </div>
        </div>
      </div>

      {/* Scan List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        {filteredScans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No scans found</p>
            <Link
              to="/upload"
              className="inline-block mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Upload Your First File
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredScans.map((scan) => (
              <Link
                key={scan._id}
                to={`/scan/${scan._id}`}
                className="block p-6 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full ${getStatusColor(
                        scan.scanStatus,
                        scan.scanResult
                      )}`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {scan.originalName}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {formatDate(scan.createdAt)} •{" "}
                        {formatFileSize(scan.fileSize || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        scan.scanStatus === "completed"
                          ? scan.scanResult?.isMalicious
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                          : scan.scanStatus === "scanning"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : scan.scanStatus === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : scan.scanStatus === "failed"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {getStatusText(scan.scanStatus, scan.scanResult)}
                    </span>
                    <svg
                      className="w-5 h-5 text-slate-400"
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
        )}
      </div>
    </div>
  );
}

export default ScanHistory;
