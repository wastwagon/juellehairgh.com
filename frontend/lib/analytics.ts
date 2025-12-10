/**
 * Analytics Tracking System
 * Tracks purchases and customer actions in real-time
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

// Generate or retrieve session ID
const getSessionId = (): string => {
  if (typeof window === "undefined") return "";
  
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

// Get user ID from localStorage
const getUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id || null;
  } catch {
    return null;
  }
};

// Get device type
const getDevice = (): string => {
  if (typeof window === "undefined") return "unknown";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

// Get traffic source
const getTrafficSource = (): string => {
  if (typeof window === "undefined") return "direct";
  const referrer = document.referrer;
  if (!referrer) return "direct";
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname;
    
    // Check for common sources
    if (hostname.includes("google")) return "google";
    if (hostname.includes("facebook")) return "facebook";
    if (hostname.includes("instagram")) return "instagram";
    if (hostname.includes("twitter")) return "twitter";
    if (hostname.includes("linkedin")) return "linkedin";
    
    return hostname;
  } catch {
    return "direct";
  }
};

// Track event
export const trackEvent = async (
  eventType: string,
  data?: {
    productId?: string;
    orderId?: string;
    revenue?: number;
    metadata?: Record<string, any>;
  }
) => {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      eventType,
      userId: getUserId(),
      sessionId: getSessionId(),
      productId: data?.productId,
      orderId: data?.orderId,
      revenue: data?.revenue,
      metadata: {
        ...data?.metadata,
        device: getDevice(),
        source: getTrafficSource(),
        url: window.location.href,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    // Send to backend (fire and forget)
    fetch(`${API_BASE_URL}/analytics/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error("Analytics tracking error:", err);
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
};

// Convenience functions
export const analytics = {
  // Page view tracking
  pageView: (path?: string) => {
    trackEvent("page_view", {
      metadata: { path: path || window.location.pathname },
    });
  },

  // Product view
  viewProduct: (productId: string, productTitle?: string) => {
    trackEvent("view_product", {
      productId,
      metadata: { productTitle },
    });
  },

  // Add to cart
  addToCart: (productId: string, quantity: number, price: number) => {
    trackEvent("add_to_cart", {
      productId,
      metadata: { quantity, price },
    });
  },

  // Begin checkout
  beginCheckout: (cartValue: number, itemCount: number) => {
    trackEvent("begin_checkout", {
      metadata: { cartValue, itemCount },
    });
  },

  // Purchase
  purchase: (orderId: string, revenue: number, items: any[]) => {
    trackEvent("purchase", {
      orderId,
      revenue,
      metadata: {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    });
  },

  // Session start
  sessionStart: () => {
    trackEvent("session_start");
  },

  // Search
  search: (query: string, resultsCount?: number) => {
    trackEvent("search", {
      metadata: { query, resultsCount },
    });
  },

  // Wishlist add
  addToWishlist: (productId: string) => {
    trackEvent("add_to_wishlist", {
      productId,
    });
  },

  // Form submission
  formSubmit: (formId: string, formName: string, formType?: string) => {
    trackEvent("form_submit", {
      metadata: { formId, formName, formType },
    });
  },

  // Video engagement
  videoPlay: (videoId: string, videoTitle?: string, videoUrl?: string) => {
    trackEvent("video_play", {
      metadata: { videoId, videoTitle, videoUrl },
    });
  },

  videoProgress: (videoId: string, progress: number, duration: number) => {
    trackEvent("video_progress", {
      metadata: { videoId, progress, duration, percentage: (progress / duration) * 100 },
    });
  },

  videoComplete: (videoId: string, duration: number) => {
    trackEvent("video_complete", {
      metadata: { videoId, duration },
    });
  },

  // Link/Button click
  linkClick: (linkText: string, linkUrl: string, linkType?: string) => {
    trackEvent("link_click", {
      metadata: { linkText, linkUrl, linkType },
    });
  },

  buttonClick: (buttonText: string, buttonId?: string, buttonType?: string) => {
    trackEvent("button_click", {
      metadata: { buttonText, buttonId, buttonType },
    });
  },
};

// Initialize session tracking on page load
if (typeof window !== "undefined") {
  // Track session start
  analytics.sessionStart();
  
  // Track initial page view
  analytics.pageView();
  
  // Track page views on navigation (for Next.js)
  let lastPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      analytics.pageView();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

