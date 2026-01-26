import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Configuration for maintenance mode check
// In Docker development, we need to use the service name 'backend' and internal port 3001
const getApiUrl = () => {
  // Middleware runs on the server (SSR)
  // In production VPS environment, always use internal service name for speed and stability
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction || (apiUrl && apiUrl.includes("localhost:9001"))) {
    // We're in Docker/Production - use the service name for internal communication
    return "http://backend:3001/api";
  }

  // Priority 2: Use NEXT_PUBLIC_API_BASE_URL if set (for local/preview)
  if (apiUrl && apiUrl.trim() !== '') {
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  }

  // Priority 3: Fallback
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

    // Check if response is OK before parsing
    if (!response.ok) {
      console.error(`Maintenance check failed: HTTP ${response.status}`);
      // If we can't check maintenance status, default to maintenance mode for safety
      // Only allow admins and public paths
      const userRole = request.cookies.get("user_role")?.value;
      const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";
      if (!isAdmin && !isPublicPath) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
      return NextResponse.next();
    }

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
    // If the check fails (e.g. backend down, network error), default to maintenance mode for safety
    // This ensures the site is protected even if the API is unavailable
    console.error("Maintenance check failed:", error);

    // Only allow admins and public paths when we can't verify maintenance status
    const userRole = request.cookies.get("user_role")?.value;
    const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";
    if (!isAdmin && !isPublicPath) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
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

