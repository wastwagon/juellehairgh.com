import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Decimal } from "@prisma/client/runtime/library";

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  // Get all shipping zones with methods
  async getAllZones() {
    return this.prisma.shippingZone.findMany({
      include: {
        methods: {
          where: { isActive: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });
  }

  // Get active zones only
  async getActiveZones() {
    return this.prisma.shippingZone.findMany({
      where: { isActive: true },
      include: {
        methods: {
          where: { isActive: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });
  }

  // Get available shipping methods for a location (country/region/city)
  async getMethodsForLocation(
    country: string,
    region?: string,
    city?: string,
    orderTotal?: number,
  ) {
    // Determine which zone to use based on location
    let zoneNames: string[];
    let regionMatches: string[] = [];

    if (country !== "Ghana") {
      // International shipping - look for "International" zone
      zoneNames = ["International Shipping", "International"];
      regionMatches = ["Everywhere"];
    } else if (city && city.toLowerCase().trim() === "tema") {
      // Tema has special pricing (even though it's in Greater Accra region)
      zoneNames = ["Tema", "Greater Accra & Tema"];
      regionMatches = ["Greater Accra"];
    } else if (region === "Greater Accra") {
      // Greater Accra region (excluding Tema)
      zoneNames = ["Greater Accra", "Greater Accra & Tema"];
      regionMatches = ["Greater Accra"];
    } else {
      // Other Ghana regions - look for zones that include this region or "All Ghana Regions"
      zoneNames = ["Other Ghana Regions", "All Ghana Regions"];
      regionMatches = region ? [region] : [];
    }

    // Find zones that match
    const zones = await this.prisma.shippingZone.findMany({
      where: {
        isActive: true,
        OR: [
          // Match by zone name
          ...zoneNames.map((name) => ({ name: { contains: name } })),
          // Match by region if country is Ghana
          ...(country === "Ghana" && regionMatches.length > 0
            ? regionMatches.map((reg) => ({ regions: { has: reg } }))
            : []),
          // For Ghana, also match zones that have "Ghana" in regions array (catch-all for all Ghana regions)
          ...(country === "Ghana" ? [{ regions: { has: "Ghana" } }] : []),
          // Match "Everywhere" for international
          ...(country !== "Ghana" ? [{ regions: { has: "Everywhere" } }] : []),
        ],
      },
      include: {
        methods: {
          where: { isActive: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });

    // Flatten methods, calculate costs, and filter out unavailable methods
    const methods = zones
      .flatMap((zone) =>
        zone.methods.map((method) => ({
          ...method,
          zoneName: zone.name,
          calculatedCost: this.calculateShippingCost(method, orderTotal),
        })),
      )
      .filter((method) => {
        // If method has freeShippingThreshold but no base cost, only show if threshold is met
        if (method.freeShippingThreshold && !method.cost && orderTotal) {
          return Number(orderTotal) >= Number(method.freeShippingThreshold);
        }
        return true; // Show all other methods
      });

    return methods;
  }

  // Legacy method for backwards compatibility
  async getMethodsForRegion(region: string, orderTotal?: number) {
    return this.getMethodsForLocation("Ghana", region, undefined, orderTotal);
  }

  // Calculate shipping cost based on method and order total
  private calculateShippingCost(method: any, orderTotal?: number): number {
    // If free shipping threshold is set and order meets it, return 0
    if (method.freeShippingThreshold && orderTotal) {
      if (Number(orderTotal) >= Number(method.freeShippingThreshold)) {
        return 0;
      }
    }

    // If method has a base cost, return it
    if (method.cost) {
      return Number(method.cost);
    }

    // If method has freeShippingThreshold but no base cost and threshold not met, return null (will be filtered)
    // Otherwise return 0 for free methods
    return 0;
  }

  // Admin: Create shipping zone
  async createZone(data: {
    name: string;
    description?: string;
    regions: string[];
    position?: number;
  }) {
    return this.prisma.shippingZone.create({
      data: {
        name: data.name,
        description: data.description,
        regions: data.regions,
        position: data.position || 0,
      },
      include: {
        methods: true,
      },
    });
  }

  // Admin: Update shipping zone
  async updateZone(
    id: string,
    data: {
      name?: string;
      description?: string;
      regions?: string[];
      isActive?: boolean;
      position?: number;
    },
  ) {
    const zone = await this.prisma.shippingZone.findUnique({
      where: { id },
    });

    if (!zone) {
      throw new NotFoundException("Shipping zone not found");
    }

    return this.prisma.shippingZone.update({
      where: { id },
      data,
      include: {
        methods: true,
      },
    });
  }

  // Admin: Delete shipping zone
  async deleteZone(id: string) {
    const zone = await this.prisma.shippingZone.findUnique({
      where: { id },
      include: { methods: true },
    });

    if (!zone) {
      throw new NotFoundException("Shipping zone not found");
    }

    if (zone.methods.length > 0) {
      throw new BadRequestException(
        "Cannot delete zone with shipping methods. Delete methods first.",
      );
    }

    return this.prisma.shippingZone.delete({
      where: { id },
    });
  }

  // Admin: Create shipping method
  async createMethod(
    zoneId: string,
    data: {
      name: string;
      description?: string;
      cost?: number;
      freeShippingThreshold?: number;
      estimatedDays?: string;
      position?: number;
    },
  ) {
    const zone = await this.prisma.shippingZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new NotFoundException("Shipping zone not found");
    }

    return this.prisma.shippingMethod.create({
      data: {
        zoneId,
        name: data.name,
        description: data.description,
        cost: data.cost ? new Decimal(data.cost) : null,
        freeShippingThreshold: data.freeShippingThreshold
          ? new Decimal(data.freeShippingThreshold)
          : null,
        estimatedDays: data.estimatedDays,
        position: data.position || 0,
      },
    });
  }

  // Admin: Update shipping method
  async updateMethod(
    id: string,
    data: {
      name?: string;
      description?: string;
      cost?: number | null;
      freeShippingThreshold?: number | null;
      estimatedDays?: string;
      isActive?: boolean;
      position?: number;
    },
  ) {
    const method = await this.prisma.shippingMethod.findUnique({
      where: { id },
    });

    if (!method) {
      throw new NotFoundException("Shipping method not found");
    }

    return this.prisma.shippingMethod.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        cost:
          data.cost !== undefined
            ? data.cost !== null
              ? new Decimal(data.cost)
              : null
            : undefined,
        freeShippingThreshold:
          data.freeShippingThreshold !== undefined
            ? data.freeShippingThreshold !== null
              ? new Decimal(data.freeShippingThreshold)
              : null
            : undefined,
        estimatedDays: data.estimatedDays,
        isActive: data.isActive,
        position: data.position,
      },
    });
  }

  // Admin: Delete shipping method
  async deleteMethod(id: string) {
    const method = await this.prisma.shippingMethod.findUnique({
      where: { id },
    });

    if (!method) {
      throw new NotFoundException("Shipping method not found");
    }

    return this.prisma.shippingMethod.delete({
      where: { id },
    });
  }

  // Get shipping method by ID
  async getMethodById(id: string) {
    const method = await this.prisma.shippingMethod.findUnique({
      where: { id },
      include: { zone: true },
    });

    if (!method) {
      throw new NotFoundException("Shipping method not found");
    }

    return method;
  }
}
