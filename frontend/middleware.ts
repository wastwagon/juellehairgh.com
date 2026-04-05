import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Configuration for maintenance mode check
// In Docker development, we need to use the service name 'backend' and internal port 3001
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const internal = process.env.INTERNAL_API_BASE_URL?.trim();

  const withApiSuffix = (base: string) =>
    base.endsWith("/api") ? base : `${base}/api`;

  // Split deploy (e.g. Coolify): public API is the source of truth for site settings.
  // If INTERNAL_API_BASE_URL points at a different instance or stale service, maintenance
  // mode would disagree with https://api.* — prefer canonical HTTPS when configured.
  if (apiUrl?.startsWith("https://")) {
    return withApiSuffix(apiUrl);
  }

  if (internal) {
    return withApiSuffix(internal);
  }

  // Same docker-compose stack as backend (docker-compose.yml with service "backend")
  if (process.env.DOCKER_ENV === "true") {
    return "http://backend:3001/api";
  }

  // Local dev on host: backend:3001 does not resolve
  if (apiUrl && apiUrl.includes("localhost")) {
    return withApiSuffix(apiUrl);
  }

  if (apiUrl) {
    return withApiSuffix(apiUrl);
  }

  return "http://localhost:9001/api";
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

  // Client-side navigations fetch RSC "flight" payloads. A 307 HTML redirect (e.g. to
  // /maintenance) is not valid flight data and causes: "Failed to fetch RSC payload"
  // and TypeError: (intermediate value) is not iterable.
  const h = request.headers;
  const rscHeader = h.get("RSC");
  const accept = h.get("accept") || "";
  const isFlightLike =
    request.nextUrl.searchParams.has("_rsc") ||
    rscHeader === "1" ||
    rscHeader === "true" ||
    h.get("Next-Router-Prefetch") === "1" ||
    h.has("Next-Router-State-Tree") ||
    h.has("Next-Router-Segment-Prefetch") ||
    accept.includes("text/x-component");

  if (isFlightLike) {
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

    const response = await fetch(`${API_URL}/settings/site`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If the settings endpoint errors, fail open: keep the storefront usable and avoid
    // breaking every soft navigation (RSC) with redirects users never meant to hit.
    if (!response.ok) {
      console.error(`Maintenance check failed: HTTP ${response.status}`);
      return NextResponse.next();
    }

    const data = await response.json();
    const isMaintenanceMode = data.maintenanceMode === true;

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
    console.error("Maintenance check failed:", error);
    return NextResponse.next();
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

