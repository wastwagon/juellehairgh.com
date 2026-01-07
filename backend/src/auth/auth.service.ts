import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Prisma } from "@prisma/client";
import { EmailService } from "../email/email.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        "An account with this email already exists. Please sign in instead.",
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
          phone: registerDto.phone,
          displayCurrency: registerDto.displayCurrency || "GHS",
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          displayCurrency: true,
          role: true,
          createdAt: true,
        },
      });

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      // Send welcome email to new user
      try {
        await this.emailService.sendWelcomeEmail(user);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }

      // Send new customer notification to admin
      try {
        await this.emailService.sendAdminNewCustomer({
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        });
      } catch (error) {
        console.error("Failed to send admin new customer notification:", error);
      }

      return {
        user,
        accessToken,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // Unique constraint violation
          throw new ConflictException(
            "An account with this email already exists. Please sign in instead.",
          );
        }
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      // Check if user has a password set
      if (!user.password) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          displayCurrency: user.displayCurrency,
          role: user.role,
        },
        accessToken,
      };
    } catch (error) {
      // If it's already an UnauthorizedException, re-throw it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log other errors for debugging
      console.error("Login error:", error);
      throw new UnauthorizedException("Login failed. Please try again.");
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        displayCurrency: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      role: user.role,
    };
  }
}
