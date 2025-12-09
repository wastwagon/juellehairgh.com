import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(data: {
    eventType: string;
    userId?: string;
    sessionId?: string;
    productId?: string;
    orderId?: string;
    revenue?: number;
    metadata?: any;
  }) {
    return this.prisma.analyticsEvent.create({
      data: {
        eventType: data.eventType,
        userId: data.userId,
        sessionId: data.sessionId,
        productId: data.productId,
        orderId: data.orderId,
        revenue: data.revenue,
        metadata: data.metadata || {},
      },
    });
  }

  async getRealtimeStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      totalRevenue,
      todayRevenue,
      totalOrders,
      todayOrders,
      activeSessions,
      pageViews,
      uniqueVisitors,
      topProducts,
      conversionRate,
      averageOrderValue,
    ] = await Promise.all([
      // Total Revenue
      this.prisma.analyticsEvent.aggregate({
        where: { eventType: "purchase", revenue: { not: null } },
        _sum: { revenue: true },
      }),

      // Today's Revenue
      this.prisma.analyticsEvent.aggregate({
        where: {
          eventType: "purchase",
          revenue: { not: null },
          createdAt: { gte: last24Hours },
        },
        _sum: { revenue: true },
      }),

      // Total Orders
      this.prisma.analyticsEvent.count({
        where: { eventType: "purchase" },
      }),

      // Today's Orders
      this.prisma.analyticsEvent.count({
        where: {
          eventType: "purchase",
          createdAt: { gte: last24Hours },
        },
      }),

      // Active Sessions (last hour)
      this.prisma.analyticsEvent.findMany({
        where: {
          createdAt: { gte: lastHour },
          sessionId: { not: null },
        },
        distinct: ["sessionId"],
        select: { sessionId: true },
      }),

      // Page Views (last 24 hours)
      this.prisma.analyticsEvent.count({
        where: {
          eventType: "page_view",
          createdAt: { gte: last24Hours },
        },
      }),

      // Unique Visitors (last 24 hours)
      this.prisma.analyticsEvent.findMany({
        where: {
          createdAt: { gte: last24Hours },
          sessionId: { not: null },
        },
        distinct: ["sessionId"],
        select: { sessionId: true },
      }),

      // Top Products (last 30 days)
      this.prisma.analyticsEvent.groupBy({
        by: ["productId"],
        where: {
          eventType: { in: ["purchase", "add_to_cart", "view_product"] },
          createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
          productId: { not: null },
        },
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 10,
      }),

      // Conversion Rate
      this.getConversionRate(),

      // Average Order Value
      this.getAverageOrderValue(),
    ]);

    return {
      totalRevenue: Number(totalRevenue._sum.revenue || 0),
      todayRevenue: Number(todayRevenue._sum.revenue || 0),
      totalOrders: totalOrders,
      todayOrders: todayOrders,
      activeSessions: activeSessions.length,
      pageViews: pageViews,
      uniqueVisitors: uniqueVisitors.length,
      topProducts: topProducts,
      conversionRate: conversionRate,
      averageOrderValue: averageOrderValue,
    };
  }

  async getConversionRate() {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [sessions, purchases] = await Promise.all([
      this.prisma.analyticsEvent.findMany({
        where: {
          eventType: "session_start",
          createdAt: { gte: last30Days },
        },
        distinct: ["sessionId"],
      }),
      this.prisma.analyticsEvent.count({
        where: {
          eventType: "purchase",
          createdAt: { gte: last30Days },
        },
      }),
    ]);

    return sessions.length > 0 ? (purchases / sessions.length) * 100 : 0;
  }

  async getAverageOrderValue() {
    const result = await this.prisma.analyticsEvent.aggregate({
      where: {
        eventType: "purchase",
        revenue: { not: null },
      },
      _avg: { revenue: true },
    });

    return Number(result._avg.revenue || 0);
  }

  async getRevenueChart(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        eventType: "purchase",
        revenue: { not: null },
        createdAt: { gte: startDate },
      },
      select: {
        revenue: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const revenueByDate: Record<string, number> = {};
    events.forEach((event) => {
      const date = event.createdAt.toISOString().split("T")[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + Number(event.revenue);
    });

    // Fill in missing dates with 0
    const result: { date: string; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        revenue: revenueByDate[dateStr] || 0,
      });
    }

    return result;
  }

  async getTopProducts(limit: number = 10) {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const productStats = await this.prisma.analyticsEvent.groupBy({
      by: ["productId"],
      where: {
        eventType: { in: ["purchase", "add_to_cart", "view_product"] },
        createdAt: { gte: last30Days },
        productId: { not: null },
      },
      _count: { productId: true },
      _sum: { revenue: true },
      orderBy: { _count: { productId: "desc" } },
      take: limit,
    });

    if (productStats.length === 0) {
      return [];
    }

    // Get product details
    const productIds = productStats.map((stat) => stat.productId!).filter(Boolean);
    if (productIds.length === 0) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        priceGhs: true,
      },
    });

    return productStats.map((stat) => {
      const product = products.find((p) => p.id === stat.productId);
      return {
        productId: stat.productId,
        product: product || null,
        views: stat._count.productId,
        revenue: Number(stat._sum.revenue || 0),
      };
    });
  }

  async getTrafficSources(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        eventType: "session_start",
        createdAt: { gte: startDate },
      },
      select: {
        metadata: true,
      },
    });

    if (events.length === 0) {
      return [];
    }

    const sources: Record<string, number> = {};
    events.forEach((event) => {
      const metadata = event.metadata as any;
      const source = metadata?.source || "direct";
      sources[source] = (sources[source] || 0) + 1;
    });

    return Object.entries(sources).map(([source, count]) => ({
      source,
      count,
      percentage: events.length > 0 ? (count / events.length) * 100 : 0,
    }));
  }

  async getSalesFunnel() {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [views, carts, checkouts, purchases] = await Promise.all([
      this.prisma.analyticsEvent.count({
        where: {
          eventType: "view_product",
          createdAt: { gte: last30Days },
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          eventType: "add_to_cart",
          createdAt: { gte: last30Days },
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          eventType: "begin_checkout",
          createdAt: { gte: last30Days },
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          eventType: "purchase",
          createdAt: { gte: last30Days },
        },
      }),
    ]);

    return {
      views,
      carts,
      checkouts,
      purchases,
      cartRate: views > 0 ? (carts / views) * 100 : 0,
      checkoutRate: carts > 0 ? (checkouts / carts) * 100 : 0,
      purchaseRate: checkouts > 0 ? (purchases / checkouts) * 100 : 0,
    };
  }

  async getDeviceBreakdown(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        eventType: "session_start",
        createdAt: { gte: startDate },
      },
      select: {
        metadata: true,
      },
    });

    if (events.length === 0) {
      return [];
    }

    const devices: Record<string, number> = {};
    events.forEach((event) => {
      const metadata = event.metadata as any;
      const device = metadata?.device || "unknown";
      devices[device] = (devices[device] || 0) + 1;
    });

    return Object.entries(devices).map(([device, count]) => ({
      device,
      count,
      percentage: events.length > 0 ? (count / events.length) * 100 : 0,
    }));
  }

  async getFormConversions(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const formSubmits = await this.prisma.analyticsEvent.findMany({
      where: {
        eventType: "form_submit",
        createdAt: { gte: startDate },
      },
      select: {
        metadata: true,
        createdAt: true,
      },
    });

    const formStats: Record<string, { count: number; name: string; type?: string }> = {};
    formSubmits.forEach((event) => {
      const metadata = event.metadata as any;
      const formId = metadata?.formId || "unknown";
      const formName = metadata?.formName || "Unknown Form";
      const formType = metadata?.formType || "contact";

      if (!formStats[formId]) {
        formStats[formId] = { count: 0, name: formName, type: formType };
      }
      formStats[formId].count++;
    });

    return Object.entries(formStats).map(([formId, stats]) => ({
      formId,
      formName: stats.name,
      formType: stats.type,
      submissions: stats.count,
    }));
  }

  async getTopLinks(days: number = 30, limit: number = 10) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const linkClicks = await this.prisma.analyticsEvent.findMany({
      where: {
        eventType: { in: ["link_click", "button_click"] },
        createdAt: { gte: startDate },
      },
      select: {
        metadata: true,
      },
    });

    const linkStats: Record<string, { count: number; text: string; url: string; type?: string }> = {};
    linkClicks.forEach((event) => {
      const metadata = event.metadata as any;
      const linkUrl = metadata?.linkUrl || metadata?.buttonId || "unknown";
      const linkText = metadata?.linkText || metadata?.buttonText || "Unknown";
      const linkType = metadata?.linkType || metadata?.buttonType || "link";

      if (!linkStats[linkUrl]) {
        linkStats[linkUrl] = { count: 0, text: linkText, url: linkUrl, type: linkType };
      }
      linkStats[linkUrl].count++;
    });

    return Object.entries(linkStats)
      .map(([url, stats]) => ({
        url: stats.url,
        text: stats.text,
        type: stats.type,
        clicks: stats.count,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  }

  async getVideoEngagement(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [plays, completions, progressEvents] = await Promise.all([
      this.prisma.analyticsEvent.count({
        where: {
          eventType: "video_play",
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          eventType: "video_complete",
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.analyticsEvent.findMany({
        where: {
          eventType: "video_progress",
          createdAt: { gte: startDate },
        },
        select: {
          metadata: true,
        },
      }),
    ]);

    const avgProgress =
      progressEvents.length > 0
        ? progressEvents.reduce((sum, event) => {
            const metadata = event.metadata as any;
            return sum + (metadata?.percentage || 0);
          }, 0) / progressEvents.length
        : 0;

    return {
      totalPlays: plays,
      totalCompletions: completions,
      completionRate: plays > 0 ? (completions / plays) * 100 : 0,
      averageProgress: avgProgress,
    };
  }

  async getUserJourney(userId?: string, sessionId?: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where: any = {
      createdAt: { gte: startDate },
    };

    if (userId) {
      where.userId = userId;
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    const events = await this.prisma.analyticsEvent.findMany({
      where,
      select: {
        eventType: true,
        metadata: true,
        createdAt: true,
        productId: true,
        orderId: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return events.map((event) => ({
      eventType: event.eventType,
      timestamp: event.createdAt,
      productId: event.productId,
      orderId: event.orderId,
      metadata: event.metadata,
    }));
  }

  async getCustomDimensions(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get product views with category information
    const productViews = await this.prisma.analyticsEvent.findMany({
      where: {
        eventType: "view_product",
        createdAt: { gte: startDate },
        productId: { not: null },
      },
      select: {
        productId: true,
        metadata: true,
      },
    });

    // Get products with categories
    const productIds = [...new Set(productViews.map((e) => e.productId!))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Category performance
    const categoryStats: Record<string, { name: string; views: number; products: Set<string> }> = {};
    productViews.forEach((view) => {
      const product = products.find((p) => p.id === view.productId);
      if (product?.category) {
        const catId = product.category.id;
        if (!categoryStats[catId]) {
          categoryStats[catId] = {
            name: product.category.name,
            views: 0,
            products: new Set(),
          };
        }
        categoryStats[catId].views++;
        categoryStats[catId].products.add(product.id);
      }
    });

    return {
      categories: Object.entries(categoryStats).map(([id, stats]) => ({
        categoryId: id,
        categoryName: stats.name,
        views: stats.views,
        uniqueProducts: stats.products.size,
      })),
    };
  }

  async getEvents(filters: {
    eventType?: string;
    userId?: string;
    sessionId?: string;
    productId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.eventType) {
      where.eventType = filters.eventType;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.sessionId) {
      where.sessionId = filters.sessionId;
    }
    if (filters.productId) {
      where.productId = filters.productId;
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [events, total] = await Promise.all([
      this.prisma.analyticsEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.analyticsEvent.count({ where }),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEvent(id: string) {
    const event = await this.prisma.analyticsEvent.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    return event;
  }
}

