import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useScan } from "../context/ScanContext";
import QuickUpload from "../components/QuickUpload";

function UploadFile() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const { uploadAndScan, loading, error, scans } = useScan();
  const navigate = useNavigate();

  // Listen for new scans and show success modal
  useEffect(() => {
    console.log("Scans updated:", scans);
    if (scans && scans.length > 0) {
      const latestScan = scans[0]; // Most recent scan
      console.log("Latest scan:", latestScan);
      if (latestScan && !uploadedFile) {
        console.log("Setting uploaded file:", latestScan);
        setUploadedFile(latestScan);
      }
    }
  }, [scans, uploadedFile]);

  const handleUploadSuccess = (scanData) => {
    console.log("Upload success handler called:", scanData);
    setUploadedFile(scanData);
  };

  const handleUploadError = (error) => {
    console.error("Upload error:", error);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Upload File for Scanning
        </h1>
        <p className="text-slate-300 text-lg">
          Drag and drop your file or click to browse. We'll scan it for malware
          and provide detailed results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-6">
            File Upload
          </h2>
          <QuickUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-6">
            How It Works
          </h2>
          <div className="space-y-4 text-slate-300">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium text-white">Upload File</h3>
                <p className="text-sm">
                  Drag and drop your file or click to browse. Supported formats
                  include PDF, DOCX, JPG, and PNG files (max 5MB).
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium text-white">Scan Processing</h3>
                <p className="text-sm">
                  Our advanced malware scanner will analyze your file for
                  threats, suspicious patterns, and malicious code.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium text-white">Get Results</h3>
                <p className="text-sm">
                  Receive detailed scan results with threat analysis,
                  recommendations, and safety status.
                </p>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-8 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="font-medium text-white mb-2">Security & Privacy</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Files are scanned in a secure environment</li>
              <li>• No files are stored permanently</li>
              <li>• All data is encrypted during transmission</li>
              <li>• Results are available for 24 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadFile;
