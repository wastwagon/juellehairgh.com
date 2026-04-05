import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Resolve API base for maintenance check (must match the backend that owns MAINTENANCE_MODE).
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const internal = process.env.INTERNAL_API_BASE_URL?.trim();

  const withApiSuffix = (base: string) =>
    base.endsWith("/api") ? base : `${base}/api`;

  // Split deploy (e.g. Coolify): no `backend` hostname — use public API as source of truth.
  if (apiUrl?.startsWith("https://")) {
    return withApiSuffix(apiUrl);
  }

  if (internal) {
    return withApiSuffix(internal);
  }

  if (process.env.DOCKER_ENV === "true") {
    return "http://backend:3001/api";
  }

  if (apiUrl && apiUrl.includes("localhost")) {
    return withApiSuffix(apiUrl);
  }

  if (apiUrl) {
    return withApiSuffix(apiUrl);
  }

  return "http://localhost:3001/api";
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const API_URL = getApiUrl();

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

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

  const publicPaths = ["/maintenance", "/admin", "/login", "/register", "/auth"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_URL}/settings/maintenance`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Maintenance check failed: HTTP ${response.status}`);
      return NextResponse.next();
    }

    const data = await response.json();
    const isMaintenanceMode = data.enabled === true;

    if (isMaintenanceMode) {
      const userRole = request.cookies.get("user_role")?.value;
      const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";

      if (!isAdmin && !isPublicPath) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    } else if (pathname === "/maintenance") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    console.error("Maintenance check failed:", error);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
