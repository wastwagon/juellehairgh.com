import axios from "axios";

// Get API base URL - ensure it includes /api
// Supports both build-time (NEXT_PUBLIC_*) and runtime configuration
const getApiBaseUrl = () => {
  let url: string | undefined;
  
  // Priority 1: Runtime config (set via window.__ENV__ from layout.tsx)
  if (typeof window !== "undefined") {
    // Client-side: Check window object for runtime config
    url = (window as any).__ENV__?.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // Priority 2: Check if we're in production (client-side detection first)
  if (typeof window !== "undefined") {
    const isProduction = window.location.protocol === "https:" || 
                        window.location.hostname.includes("render.com") ||
                        window.location.hostname.includes("onrender.com");
    
    if (isProduction) {
      // In production, prioritize explicit env var, then infer from frontend URL
      if (!url) {
        url = process.env.NEXT_PUBLIC_API_BASE_URL;
      }
      
      // If still no URL or URL is localhost, infer from frontend URL
      if (!url || url.includes("localhost")) {
        const frontendUrl = window.location.origin;
        // Common Render pattern: if frontend is juelle-hair-web, backend might be juelle-hair-api or juelle-hair-backend
        let backendUrl = frontendUrl.replace("-web", "-api");
        if (backendUrl === frontendUrl) {
          backendUrl = frontendUrl.replace("juelle-hair-web", "juelle-hair-api");
          if (backendUrl === frontendUrl) {
            backendUrl = frontendUrl.replace("juelle-hair-web", "juelle-hair-backend");
          }
        }
        url = `${backendUrl}/api`;
        if (!process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL.includes("localhost")) {
          console.warn("⚠️ API Base URL not configured or set to localhost, inferred from frontend URL:", url);
          console.warn("⚠️ Please set NEXT_PUBLIC_API_BASE_URL environment variable in Render!");
        }
      }
    } else {
      // Development: use build-time env var or localhost
      if (!url) {
        url = process.env.NEXT_PUBLIC_API_BASE_URL;
      }
      if (!url) {
        url = "http://localhost:3001/api";
      }
    }
  } else {
    // Server-side: use env var or fallback
    url = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    // Server-side production detection
    if (!url || url.includes("localhost")) {
      const renderUrl = process.env.RENDER_EXTERNAL_URL || "";
      if (renderUrl) {
        let backendUrl = renderUrl.replace("-web", "-api");
        if (backendUrl === renderUrl) {
          backendUrl = renderUrl.replace("juelle-hair-web", "juelle-hair-api");
          if (backendUrl === renderUrl) {
            backendUrl = renderUrl.replace("juelle-hair-web", "juelle-hair-backend");
          }
        }
        if (backendUrl !== renderUrl) {
          url = `${backendUrl}/api`;
        }
      }
    }
    
    if (!url) {
      url = "http://localhost:3001/api";
    }
  }
  
  // Ensure it ends with /api
  const finalUrl = url.endsWith("/api") ? url : `${url}/api`;
  
  return finalUrl;
};

// Don't set a constant - always call getApiBaseUrl() dynamically
// This ensures runtime detection works correctly

// Create axios instance with dynamic base URL
// Use a function to get baseURL so it's always resolved at request time
export const api = axios.create({
  baseURL: typeof window !== "undefined" ? getApiBaseUrl() : "http://localhost:3001/api", // Initial value, will be updated
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
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
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

