import React from "react";
import { Link } from "react-router-dom";
import { useScan } from "../context/ScanContext";
import StatCard from "../components/StatCard";
import RecentScans from "../components/RecentScans";
import QuickUpload from "../components/QuickUpload";

function Dashboard() {
  const { stats, scans, loading, error } = useScan();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Malware Scanner Dashboard
        </h1>
        <p className="text-slate-300 text-lg">
          Protect your files with advanced malware detection
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Scans"
          value={stats.total}
          icon="📊"
          color="bg-blue-500"
        />
        <StatCard
          title="Clean Files"
          value={stats.clean}
          icon="✅"
          color="bg-green-500"
        />
        <StatCard
          title="Infected Files"
          value={stats.infected}
          icon="🦠"
          color="bg-red-500"
        />
        <StatCard
          title="Pending Scans"
          value={stats.pending}
          icon="⏳"
          color="bg-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Upload</h2>
          <QuickUpload />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            Recent Activity
          </h2>
          <RecentScans scans={scans.slice(0, 5)} />
          <div className="mt-4">
            <Link
              to="/history"
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              View all scans →
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white"
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
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Easy Upload</h3>
          <p className="text-slate-300 text-sm">
            Drag and drop files or click to browse. Supports multiple file
            formats.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Real-time Scanning
          </h3>
          <p className="text-slate-300 text-sm">
            Advanced malware detection with real-time status updates and
            detailed reports.
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Detailed Reports
          </h3>
          <p className="text-slate-300 text-sm">
            Comprehensive scan reports with threat details and security
            recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
