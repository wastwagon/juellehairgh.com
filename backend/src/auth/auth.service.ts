import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Prisma } from "@prisma/client";
import { EmailService } from "../email/email.service";
import { WalletService } from "../wallet/wallet.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private walletService: WalletService,
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

      // Create wallet for new user
      try {
        await this.walletService.getOrCreateWallet(user.id);
      } catch (error) {
        console.error("Failed to create wallet for new user:", error);
        // Don't throw - wallet creation failure shouldn't block registration
      }

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

  /**
   * Request password reset - sends email with reset link
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    // Don't reveal if user exists for security
    if (!user) {
      return {
        message: "If that email exists, a password reset link has been sent.",
      };
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

    // Save reset token to user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send password reset email (non-blocking)
    try {
      await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      // Don't throw - token is already saved
    }

    return {
      message: "If that email exists, a password reset link has been sent.",
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Find user by reset token
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: resetPasswordDto.token },
    });

    if (!user) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    // Check if token has expired
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      // Clear expired token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      throw new BadRequestException("Reset token has expired. Please request a new one.");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return {
      message: "Password has been reset successfully. You can now login with your new password.",
    };
  }
}
