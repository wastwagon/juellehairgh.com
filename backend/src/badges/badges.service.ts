import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  async getAllTemplates() {
    return this.prisma.badgeTemplate.findMany({
      orderBy: [{ isPredefined: "desc" }, { name: "asc" }],
    });
  }

  async getActiveTemplates() {
    return this.prisma.badgeTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ isPredefined: "desc" }, { name: "asc" }],
    });
  }

  async getTemplate(id: string) {
    const template = await this.prisma.badgeTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException("Badge template not found");
    }

    return template;
  }

  async createTemplate(data: {
    name: string;
    label: string;
    color?: string;
    textColor?: string;
    style?: string;
    isPredefined?: boolean;
  }) {
    // Check if name already exists
    const existing = await this.prisma.badgeTemplate.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new BadRequestException("Badge template with this name already exists");
    }

    return this.prisma.badgeTemplate.create({
      data: {
        name: data.name,
        label: data.label,
        color: data.color || "#3B82F6",
        textColor: data.textColor || "#FFFFFF",
        style: data.style || "rounded",
        isPredefined: data.isPredefined || false,
      },
    });
  }

  async updateTemplate(id: string, data: {
    label?: string;
    color?: string;
    textColor?: string;
    style?: string;
    isActive?: boolean;
  }) {
    const template = await this.getTemplate(id);

    // Prevent editing predefined templates' name
    return this.prisma.badgeTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteTemplate(id: string) {
    const template = await this.getTemplate(id);

    if (template.isPredefined) {
      throw new BadRequestException("Cannot delete predefined badge templates");
    }

    return this.prisma.badgeTemplate.delete({
      where: { id },
    });
  }
}
