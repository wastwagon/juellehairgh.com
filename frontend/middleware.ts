import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Configuration for maintenance mode check
// In Docker development, we need to use the service name 'backend' and internal port 3001
const getApiUrl = () => {
  // Priority 1: Check if NEXT_PUBLIC_API_BASE_URL is set and not a production URL
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // If set and not localhost/production domain, use it
  if (apiUrl && !apiUrl.includes('api.juellehairgh.com')) {
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  }
  
  // Priority 2: Development mode - use localhost
  if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
    // Try Docker service name first (for Docker Compose)
    if (process.env.DOCKER_ENV) {
      return "http://backend:3001/api";
    }
    // Fallback to localhost
    return "http://localhost:3001/api";
  }
  
  // Priority 3: Fallback to localhost or production
  if (apiUrl && apiUrl.includes('api.juellehairgh.com')) {
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  }
  
  return "http://localhost:3001/api";
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const API_URL = getApiUrl();

  // 1. Skip checks for static assets, images, and internal Next.js paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 2. Paths that are ALWAYS accessible (even during maintenance)
  // We include /admin and /auth so the admin can log in to turn maintenance off
  const publicPaths = ["/maintenance", "/admin", "/login", "/register", "/auth"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  try {
    // 3. Check maintenance status from the backend
    // Note: We use a short timeout to prevent blocking the site if the API is slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_URL}/settings/maintenance`, {
      signal: controller.signal,
      next: { revalidate: 60 }, // Cache for 60 seconds to reduce API load
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    const isMaintenanceMode = data.enabled === true;

    // 4. Handle logic if maintenance mode is ACTIVE
    if (isMaintenanceMode) {
      // Check for user role cookie
      const userRole = request.cookies.get("user_role")?.value;
      const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";

      // If not an admin and trying to access a restricted page, redirect to maintenance
      if (!isAdmin && !isPublicPath) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    } else {
      // 5. If maintenance mode is INACTIVE, redirect away from /maintenance
      if (pathname === "/maintenance") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (error) {
    // If the check fails (e.g. backend down), we default to letting people in 
    // to avoid a site-wide crash, or you can choose to redirect to maintenance.
    console.error("Maintenance check failed:", error);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

