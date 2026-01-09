-- Complete Migration: Add ALL missing columns to existing tables
-- Run this BEFORE running schema.sql

-- ============================================
-- AREAS: Add missing columns
-- ============================================

-- Add location column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'areas' 
    AND column_name = 'location'
  ) THEN
    ALTER TABLE public.areas ADD COLUMN location TEXT;
  END IF;
END $$;

-- Add manager_id column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'areas' 
    AND column_name = 'manager_id'
  ) THEN
    ALTER TABLE public.areas ADD COLUMN manager_id UUID REFERENCES public.profiles(id);
  END IF;
END $$;

-- Add is_active column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'areas' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.areas ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- Add updated_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'areas' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.areas ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- ============================================
-- CATEGORIES: Add missing columns
-- ============================================

-- Add color column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'categories' 
    AND column_name = 'color'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN color TEXT DEFAULT '#0D68B1';
  END IF;
END $$;

-- Add icon column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'categories' 
    AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN icon TEXT DEFAULT 'package';
  END IF;
END $$;

-- Add parent_id column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'categories' 
    AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN parent_id UUID REFERENCES public.categories(id);
  END IF;
END $$;

-- Add is_active column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'categories' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- ============================================
-- INVENTORY_ITEMS: Add missing columns
-- ============================================

-- Add status column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_items' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.inventory_items ADD COLUMN status TEXT NOT NULL DEFAULT 'available';
  END IF;
END $$;

-- Add condition column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_items' 
    AND column_name = 'condition'
  ) THEN
    ALTER TABLE public.inventory_items ADD COLUMN condition TEXT DEFAULT 'good';
  END IF;
END $$;

-- Add min_stock_level column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_items' 
    AND column_name = 'min_stock_level'
  ) THEN
    ALTER TABLE public.inventory_items ADD COLUMN min_stock_level INTEGER NOT NULL DEFAULT 5;
  END IF;
END $$;

-- Add max_stock_level column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_items' 
    AND column_name = 'max_stock_level'
  ) THEN
    ALTER TABLE public.inventory_items ADD COLUMN max_stock_level INTEGER;
  END IF;
END $$;

-- Add is_low_stock column (generated)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_items' 
    AND column_name = 'is_low_stock'
  ) THEN
    ALTER TABLE public.inventory_items 
    ADD COLUMN is_low_stock BOOLEAN GENERATED ALWAYS AS (quantity <= min_stock_level) STORED;
  END IF;
END $$;

-- Add manufacturer column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_items' 
    AND column_name = 'manufacturer'
  ) THEN
    ALTER TABLE public.inventory_items ADD COLUMN manufacturer TEXT;
  END IF;
END $$;

-- Add model column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_items' 
    AND column_name = 'model'
  ) THEN
    ALTER TABLE public.inventory_items ADD COLUMN model TEXT;
  END IF;
END $$;

-- Add warranty_expiry column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_items' 
    AND column_name = 'warranty_expiry'
  ) THEN
    ALTER TABLE public.inventory_items ADD COLUMN warranty_expiry DATE;
  END IF;
END $$;

-- Add created_by column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_items' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.inventory_items ADD COLUMN created_by UUID REFERENCES public.profiles(id);
  END IF;
END $$;

-- ============================================
-- INVENTORY_TRANSACTIONS: Add missing columns
-- ============================================

-- Add status column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_transactions' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.inventory_transactions ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Add issued_by column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_transactions' 
    AND column_name = 'issued_by'
  ) THEN
    ALTER TABLE public.inventory_transactions ADD COLUMN issued_by UUID REFERENCES public.profiles(id);
  END IF;
END $$;

-- Add issue_date column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_transactions' 
    AND column_name = 'issue_date'
  ) THEN
    ALTER TABLE public.inventory_transactions ADD COLUMN issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Add expected_return_date column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_transactions' 
    AND column_name = 'expected_return_date'
  ) THEN
    ALTER TABLE public.inventory_transactions ADD COLUMN expected_return_date TIMESTAMPTZ;
  END IF;
END $$;

-- Add actual_return_date column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_transactions' 
    AND column_name = 'actual_return_date'
  ) THEN
    ALTER TABLE public.inventory_transactions ADD COLUMN actual_return_date TIMESTAMPTZ;
  END IF;
END $$;

-- Add purpose column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_transactions' 
    AND column_name = 'purpose'
  ) THEN
    ALTER TABLE public.inventory_transactions ADD COLUMN purpose TEXT;
  END IF;
END $$;

-- ============================================
-- PROFILES: Add missing columns
-- ============================================

-- Add department column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'department'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN department TEXT;
  END IF;
END $$;

-- Add phone column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Add is_active column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================
-- Done!
-- ============================================
SELECT 'All columns added successfully! Now run schema.sql' as result;
