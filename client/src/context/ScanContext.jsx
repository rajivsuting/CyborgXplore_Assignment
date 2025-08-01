import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scanAPI } from "../services/api";

const API_BASE_URL = "http://localhost:3001/api";

const ScanContext = createContext();

const initialState = {
  scans: [],
  loading: false,
  error: null,
  stats: {
    total: 0,
    clean: 0,
    infected: 0,
    pending: 0,
  },
};

const scanReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_SCANS":
      return { ...state, scans: action.payload, loading: false };
    case "ADD_SCAN":
      return { ...state, scans: [action.payload, ...state.scans] };
    case "UPDATE_SCAN":
      return {
        ...state,
        scans: state.scans.map((scan) =>
          scan._id === action.payload._id
            ? { ...scan, ...action.payload }
            : scan
        ),
      };
    case "SET_STATS":
      return { ...state, stats: action.payload };
    default:
      return state;
  }
};

export const ScanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(scanReducer, initialState);
  const queryClient = useQueryClient();

  // React Query hooks
  const {
    data: scansData,
    isLoading: scansLoading,
    error: scansError,
    refetch: refetchScans,
  } = useQuery({
    queryKey: ["scans"],
    queryFn: () => scanAPI.getScans().then((res) => res.data),
    staleTime: 30000, // 30 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: () => scanAPI.getScanStats().then((res) => res.data),
    staleTime: 60000, // 1 minute
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file) => scanAPI.uploadFile(file).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["scans"]);
      queryClient.invalidateQueries(["stats"]);
      dispatch({ type: "ADD_SCAN", payload: data });
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
    },
  });

  // Update scan status mutation
  const updateScanStatusMutation = useMutation({
    mutationFn: ({ id, status, results }) =>
      scanAPI.getScanStatus(id).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["scans"]);
      dispatch({
        type: "UPDATE_SCAN",
        payload: {
          _id: variables.id,
          scanStatus: data.status,
          scanResult: data.result,
        },
      });
    },
  });

  // Update state when query data changes
  useEffect(() => {
    if (scansData) {
      dispatch({ type: "SET_SCANS", payload: scansData });
    }
  }, [scansData]);

  useEffect(() => {
    if (statsData) {
      dispatch({ type: "SET_STATS", payload: statsData });
    }
  }, [statsData]);

  // Polling for pending scans
  useEffect(() => {
    const pollPendingScans = async () => {
      const pendingScans = state.scans.filter(
        (scan) =>
          scan.scanStatus === "pending" || scan.scanStatus === "scanning"
      );

      for (const scan of pendingScans) {
        try {
          const response = await scanAPI.getScanStatus(scan._id);
          const updatedScan = response.data;

          if (
            updatedScan.status !== "pending" &&
            updatedScan.status !== "scanning"
          ) {
            updateScanStatusMutation.mutate({
              id: scan._id,
              status: updatedScan.status,
              results: updatedScan.result,
            });
          }
        } catch (error) {
          console.error("Error polling scan:", error);
        }
      }
    };

    const interval = setInterval(pollPendingScans, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [state.scans]);

  const uploadAndScan = async (file) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const result = await uploadMutation.mutateAsync(file);
      console.log("Upload successful:", result);
      return result;
    } catch (error) {
      console.error("Upload error:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const getScanDetails = async (id) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await scanAPI.getScanDetails(id);
      return response.data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const calculateStats = () => {
    const stats = {
      total: state.scans.length,
      clean: state.scans.filter(
        (scan) =>
          scan.scanStatus === "completed" && !scan.scanResult?.isMalicious
      ).length,
      infected: state.scans.filter(
        (scan) =>
          scan.scanStatus === "completed" && scan.scanResult?.isMalicious
      ).length,
      pending: state.scans.filter(
        (scan) =>
          scan.scanStatus === "pending" || scan.scanStatus === "scanning"
      ).length,
    };
    return stats;
  };

  const value = {
    ...state,
    uploadAndScan,
    getScanDetails,
    calculateStats,
    refetchScans,
    uploadMutation,
    updateScanStatusMutation,
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error("useScan must be used within a ScanProvider");
  }
  return context;
};
