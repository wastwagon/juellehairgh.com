import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    }

    return wallet;
  }

  async getUserWallet(userId: string) {
    return this.getOrCreateWallet(userId);
  }

  async getAllWallets(query: any) {
    const { page = 1, limit = 20, search = "" } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WalletWhereInput = {};
    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [wallets, total] = await Promise.all([
      this.prisma.wallet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: { balance: "desc" },
        skip,
        take: parseInt(limit),
      }),
      this.prisma.wallet.count({ where }),
    ]);

    return {
      wallets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addFunds(
    walletId: string,
    amount: number,
    description?: string,
    reference?: string,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    if (amount <= 0) {
      throw new BadRequestException("Amount must be greater than 0");
    }

    const newBalance = Number(wallet.balance) + amount;

    const [updatedWallet] = await Promise.all([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId,
          type: "ADMIN_CREDIT",
          amount,
          balanceAfter: newBalance,
          description: description || `Admin added funds`,
          reference,
        },
      }),
    ]);

    return updatedWallet;
  }

  async deductFunds(walletId: string, amount: number, description?: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    if (amount <= 0) {
      throw new BadRequestException("Amount must be greater than 0");
    }

    const currentBalance = Number(wallet.balance);
    if (currentBalance < amount) {
      throw new BadRequestException("Insufficient wallet balance");
    }

    const newBalance = currentBalance - amount;

    const [updatedWallet] = await Promise.all([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId,
          type: "ADMIN_DEBIT",
          amount: -amount,
          balanceAfter: newBalance,
          description: description || `Admin deducted funds`,
        },
      }),
    ]);

    return updatedWallet;
  }

  async getTransactions(walletId: string, query: any) {
    const { page = 1, limit = 50, type, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = {
      walletId,
    };

    if (type) {
      where.type = type as any;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllTransactions(query: any) {
    const { page = 1, limit = 50, userId, type, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = {};

    if (userId) {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId },
      });
      if (wallet) {
        where.walletId = wallet.id;
      } else {
        return {
          transactions: [],
          pagination: { page: 1, limit, total: 0, totalPages: 0 },
        };
      }
    }

    if (type) {
      where.type = type as any;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        include: {
          wallet: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async topUp(userId: string, amount: number, reference: string) {
    const wallet = await this.getOrCreateWallet(userId);

    if (amount <= 0) {
      throw new BadRequestException("Amount must be greater than 0");
    }

    // Check if transaction with this reference already exists
    const existingTransaction = await this.prisma.walletTransaction.findUnique({
      where: { reference },
    });

    if (existingTransaction) {
      throw new BadRequestException("Transaction already processed");
    }

    const newBalance = Number(wallet.balance) + amount;

    const [updatedWallet] = await Promise.all([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "TOP_UP",
          amount,
          balanceAfter: newBalance,
          description: `Wallet top-up via Paystack`,
          reference,
        },
      }),
    ]);

    return updatedWallet;
  }

  async useWalletForPayment(
    userId: string,
    amount: number,
    orderId: string | null = null,
  ) {
    const wallet = await this.getOrCreateWallet(userId);
    const currentBalance = Number(wallet.balance);

    if (currentBalance < amount) {
      throw new BadRequestException("Insufficient wallet balance");
    }

    const newBalance = currentBalance - amount;

    const [updatedWallet] = await Promise.all([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "PAYMENT",
          amount: -amount,
          balanceAfter: newBalance,
          description: orderId
            ? `Payment for order ${orderId}`
            : "Payment for order",
          orderId: orderId || null,
        },
      }),
    ]);

    return updatedWallet;
  }

  async refundToWallet(orderId: string, amount: number) {
    // Find the payment transaction for this order
    const paymentTransaction = await this.prisma.walletTransaction.findFirst({
      where: {
        orderId,
        type: "PAYMENT",
      },
      include: {
        wallet: true,
      },
    });

    if (!paymentTransaction) {
      throw new NotFoundException("Payment transaction not found");
    }

    const wallet = paymentTransaction.wallet;
    const newBalance = Number(wallet.balance) + amount;

    const [updatedWallet] = await Promise.all([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "REFUND",
          amount,
          balanceAfter: newBalance,
          description: `Refund for order ${orderId}`,
          orderId,
        },
      }),
    ]);

    return updatedWallet;
  }

  async getWalletStats() {
    const [totalWallets, totalBalance, totalTransactions, topUsers] =
      await Promise.all([
        this.prisma.wallet.count(),
        this.prisma.wallet.aggregate({
          _sum: {
            balance: true,
          },
        }),
        this.prisma.walletTransaction.count(),
        this.prisma.wallet.findMany({
          take: 10,
          orderBy: { balance: "desc" },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        }),
      ]);

    return {
      totalWallets,
      totalBalance: totalBalance._sum.balance || 0,
      totalTransactions,
      topUsers,
    };
  }
}
