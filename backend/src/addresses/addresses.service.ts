import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, addressData: any) {
    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        ...addressData,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException("Address not found");
    }

    return address;
  }

  async update(id: string, userId: string, addressData: any) {
    const address = await this.findOne(id, userId);

    // If this is set as default, unset other default addresses
    if (addressData.isDefault && !address.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: addressData,
    });
  }

  async delete(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    return this.prisma.address.delete({
      where: { id },
    });
  }

  async setDefault(id: string, userId: string) {
    const address = await this.findOne(id, userId);

    // Unset all other default addresses
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this as default
    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}






