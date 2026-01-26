import axios from "axios";

// Get API base URL - ensure it includes /api
// Supports both build-time (NEXT_PUBLIC_*) and runtime configuration
const getApiBaseUrl = () => {
  let url: string | undefined;

  // Priority 1: Server-side environment (Docker internal network)
  // When running on the server (SSR), we should ALWAYS use the internal service name
  // if we are in a Docker environment (Coolify/Docker Compose)
  if (typeof window === "undefined") {
    // Check if we are in Docker (either via explicit env var or by default for server-side)
    // In production VPS, the backend is reachable at http://backend:3001
    const isDocker = process.env.DOCKER_ENV === "true" || process.env.NODE_ENV === "production";

    if (isDocker) {
      return "http://backend:3001/api";
    }

    // Fallback for local SSR without Docker
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
  }

  // Priority 2: Runtime config (set via window.__ENV__ from layout.tsx)
  if (typeof window !== "undefined") {
    url = (window as any).__ENV__?.NEXT_PUBLIC_API_BASE_URL;
  }

  // Priority 3: Production detection and inference
  if (typeof window !== "undefined") {
    const isProduction = window.location.protocol === "https:";

    if (isProduction) {
      if (!url) {
        url = process.env.NEXT_PUBLIC_API_BASE_URL;
      }

      if (!url || url.includes("localhost")) {
        const frontendUrl = window.location.origin;
        url = `${frontendUrl}/api`;
        console.warn("⚠️ API Base URL inferred from frontend URL:", url);
      }
    } else {
      if (!url) {
        url = process.env.NEXT_PUBLIC_API_BASE_URL;
      }
      if (!url) {
        url = "http://localhost:3001/api";
      }
    }
  }

  // Ensure it ends with /api
  const finalUrl = url?.endsWith("/api") ? url : `${url}/api`;
  return finalUrl;
};

// Create axios instance with dynamic base URL and timeout
export const api = axios.create({
  baseURL: typeof window !== "undefined" ? getApiBaseUrl() : "http://backend:3001/api",
  timeout: 10000, // 10 second timeout to prevent hanging and 504s
  headers: {
    "Content-Type": "application/json",
  },
});

// Log the resolved API base URL on client-side initialization (development only)
if (process.env.NODE_ENV === 'development' && typeof window !== "undefined") {
  const resolvedUrl = getApiBaseUrl();
  console.log("🔧 API Base URL configured:", resolvedUrl);
}

// Request interceptor to update baseURL dynamically and add auth token
api.interceptors.request.use((config) => {
  // Always get fresh baseURL (supports runtime env vars and production detection)
  const dynamicBaseUrl = getApiBaseUrl();
  config.baseURL = dynamicBaseUrl;

  // Log the full URL being requested (only in development to reduce noise)
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname.includes("127.0.0.1"))) {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
  }

  // Automatically add auth token if available and not already set
  if (typeof window !== "undefined" && !config.headers.Authorization) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // List of SEO endpoints that may not be implemented yet - don't log 404 errors for these
    const silent404Endpoints = [
      '/seo/redirects',
      '/seo/404s',
      '/backlinks/stats',
      '/keywords/tracking/list',
      '/keywords/analysis',
      '/admin/seo/settings',
    ];

    const isSilent404 = error.response?.status === 404 &&
      silent404Endpoints.some(endpoint => error.config?.url?.includes(endpoint));

    // Only log errors that aren't silent 404s
    if (!isSilent404) {
      console.error("API Error:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const currentPath = window.location.pathname;
        if (currentPath.startsWith("/admin")) {
          window.location.href = `/login?redirect=${currentPath}`;
        } else if (currentPath.startsWith("/account")) {
          window.location.href = `/login?redirect=${currentPath}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

