import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// API endpoints
export const scanAPI = {
  // Get all scans
  getScans: () => api.get("/scans"),

  // Get scan details
  getScanDetails: (id) => api.get(`/scans/${id}`),

  // Get scan status
  getScanStatus: (id) => api.get(`/scans/status/${id}`),

  // Upload file
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get scan history
  getScanHistory: (page = 1, limit = 10, status) => {
    const params = { page, limit };
    if (status) params.status = status;
    return api.get("/scans/history", { params });
  },

  // Get scan stats
  getScanStats: () => api.get("/scans/stats"),

  // Initiate scan
  initiateScan: (id) => api.post(`/scans/initiate/${id}`),

  // Rescan file
  rescanFile: (id) => api.post(`/scans/rescan/${id}`),
};

export default api;
