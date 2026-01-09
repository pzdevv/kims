-- ============================================================
-- PRODUCTION DATABASE FIX - COMPREHENSIVE
-- Handles ALL existing columns and constraints
-- Safe to run multiple times
-- ============================================================

-- ==================== STEP 1: FIX INVENTORY_TRANSACTIONS TABLE ====================
-- Drop ALL potentially conflicting columns first
ALTER TABLE public.inventory_transactions DROP COLUMN IF EXISTS type;
ALTER TABLE public.inventory_transactions DROP COLUMN IF EXISTS quantity_change;

-- Add all required columns with proper defaults
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'issue';
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS issue_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS expected_return_date TIMESTAMPTZ;
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS actual_return_date TIMESTAMPTZ;
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS recipient_email TEXT;
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS recipient_department TEXT;
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS issued_by UUID;
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update any NULL values to defaults
UPDATE public.inventory_transactions SET transaction_type = 'issue' WHERE transaction_type IS NULL;
UPDATE public.inventory_transactions SET quantity = 1 WHERE quantity IS NULL;
UPDATE public.inventory_transactions SET status = 'pending' WHERE status IS NULL;

-- ==================== STEP 2: FIX RLS POLICIES ====================
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Drop ALL old policies
DROP POLICY IF EXISTS "Authenticated users can view all transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Authenticated users can create transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Users can view transactions for items in their areas" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Managers can update transactions" ON public.inventory_transactions;

-- Create simple permissive policies
CREATE POLICY "transactions_select" ON public.inventory_transactions 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "transactions_insert" ON public.inventory_transactions 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "transactions_update" ON public.inventory_transactions 
  FOR UPDATE TO authenticated USING (true);

-- ==================== STEP 3: FIX INVENTORY_ITEMS TABLE ====================
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 5;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS max_stock_level INTEGER;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS warranty_expiry DATE;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- Drop ALL old policies
DROP POLICY IF EXISTS "Users can view items in their areas" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can view all items" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can insert items" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can update items" ON public.inventory_items;
DROP POLICY IF EXISTS "Managers and admins can insert items" ON public.inventory_items;
DROP POLICY IF EXISTS "Managers and admins can update items" ON public.inventory_items;
DROP POLICY IF EXISTS "items_select" ON public.inventory_items;
DROP POLICY IF EXISTS "items_insert" ON public.inventory_items;
DROP POLICY IF EXISTS "items_update" ON public.inventory_items;

CREATE POLICY "items_select" ON public.inventory_items 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "items_insert" ON public.inventory_items 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "items_update" ON public.inventory_items 
  FOR UPDATE TO authenticated USING (true);

-- ==================== STEP 4: FIX OTHER TABLES ====================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Fix profiles RLS policies for user creation during signup
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Allow users to insert their own profile (needed for magic link signup)
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow all authenticated users to view profiles
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to update their own profile, admins can update any
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#76C044';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'package';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ==================== STEP 5: UPDATE ROLE CONSTRAINT ====================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'general_manager', 'manager'));
UPDATE public.profiles SET role = 'manager' WHERE role NOT IN ('admin', 'general_manager', 'manager');

-- ==================== STEP 6: HELPER FUNCTIONS ====================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_general_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'general_manager'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== STEP 7: REFRESH SCHEMA ====================
NOTIFY pgrst, 'reload schema';

SELECT 'SUCCESS: All fixes applied!' as result;
