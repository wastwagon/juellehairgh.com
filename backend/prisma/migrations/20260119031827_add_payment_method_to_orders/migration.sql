-- Migration: Add paymentMethod column to orders table
-- This migration adds the paymentMethod column to store the payment method type
-- (paystack, wallet, cash_on_delivery) for each order

-- Add paymentMethod column (nullable, defaults to 'paystack')
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'paystack';
