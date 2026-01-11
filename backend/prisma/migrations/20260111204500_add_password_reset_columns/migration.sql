-- Migration: Add password reset columns to users table
-- This migration adds the passwordResetToken and passwordResetExpires columns
-- that were added to the Prisma schema for password reset functionality

-- Add passwordResetToken column (nullable, unique)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;

-- Add passwordResetExpires column (nullable)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);

-- Create unique index on passwordResetToken
CREATE UNIQUE INDEX IF NOT EXISTS "users_passwordResetToken_key" ON users("passwordResetToken");

-- Create index on passwordResetToken for faster lookups
CREATE INDEX IF NOT EXISTS "users_passwordResetToken_idx" ON users("passwordResetToken");
