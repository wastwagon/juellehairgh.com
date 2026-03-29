/**
 * Storefront origin for canonical URLs, Open Graph, JSON-LD, and metadataBase.
 *
 * Never use .replace("/api", "") on the full API base URL: for hosts like
 * api.example.com the first "/api" substring is the slash before the hostname
 * "api" (e.g. https://api.example.com/api → https:/.example.com/api).
 */
export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.split(",")[0]?.trim();
  if (!raw) return "https://juellehairgh.com";

  try {
    const u = new URL(raw);
    let host = u.hostname;
    if (host.startsWith("api.")) {
      host = host.slice(4);
    }
    const protocol =
      u.protocol === "http:" || u.protocol === "https:" ? u.protocol : "https:";
    return `${protocol}//${host}`;
  } catch {
    return "https://juellehairgh.com";
  }
}
