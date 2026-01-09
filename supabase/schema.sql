-- Kavya Inventory Management System - Complete Database Schema
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'staff', 'viewer')),
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AREAS TABLE
-- Inventory storage locations/departments
-- ============================================
CREATE TABLE IF NOT EXISTS public.areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  location TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- USER_AREAS JUNCTION TABLE
-- Maps users to their permitted areas
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_areas (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, area_id)
);

-- ============================================
-- CATEGORIES TABLE
-- Inventory item categories
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#0D68B1',
  icon TEXT DEFAULT 'package',
  parent_id UUID REFERENCES public.categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INVENTORY_ITEMS TABLE
-- Main inventory items
-- ============================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  area_id UUID REFERENCES public.areas(id),
  serial_number TEXT,
  barcode TEXT,
  purchase_date DATE,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock_level INTEGER NOT NULL DEFAULT 5 CHECK (min_stock_level >= 0),
  max_stock_level INTEGER,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'maintenance', 'retired')),
  location TEXT,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'good', 'fair', 'poor')),
  manufacturer TEXT,
  model TEXT,
  warranty_expiry DATE,
  notes TEXT,
  is_low_stock BOOLEAN GENERATED ALWAYS AS (quantity <= min_stock_level) STORED,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INVENTORY_TRANSACTIONS TABLE
-- Track all inventory movements
-- ============================================
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('issue', 'return', 'add', 'remove', 'adjust', 'maintenance', 'audit')),
  quantity INTEGER NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  issued_by UUID REFERENCES public.profiles(id),
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_return_date TIMESTAMPTZ,
  actual_return_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'returned', 'overdue', 'cancelled')),
  purpose TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_area ON public.inventory_items(area_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON public.inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_low_stock ON public.inventory_items(is_low_stock) WHERE is_low_stock = true;
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON public.inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_user ON public.inventory_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_status ON public.inventory_transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_areas_user ON public.user_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_areas_area ON public.user_areas(area_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is manager or above
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to an area
CREATE OR REPLACE FUNCTION public.has_area_access(area_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admins have access to all areas
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is assigned to the area
  RETURN EXISTS (
    SELECT 1 FROM public.user_areas
    WHERE user_id = auth.uid() AND area_id = area_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for areas updated_at
DROP TRIGGER IF EXISTS update_areas_updated_at ON public.areas;
CREATE TRIGGER update_areas_updated_at
  BEFORE UPDATE ON public.areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for categories updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for inventory_items updated_at
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile on signup" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view areas" ON public.areas;
DROP POLICY IF EXISTS "Admins can insert areas" ON public.areas;
DROP POLICY IF EXISTS "Admins can update areas" ON public.areas;
DROP POLICY IF EXISTS "Users can view their own area assignments" ON public.user_areas;
DROP POLICY IF EXISTS "Admins can view all area assignments" ON public.user_areas;
DROP POLICY IF EXISTS "Admins can manage area assignments" ON public.user_areas;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Users can insert their own profile on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- AREAS POLICIES
-- ============================================
CREATE POLICY "Authenticated users can view areas"
  ON public.areas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert areas"
  ON public.areas FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update areas"
  ON public.areas FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete areas"
  ON public.areas FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================
-- USER_AREAS POLICIES
-- ============================================
CREATE POLICY "Users can view their own area assignments"
  ON public.user_areas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all area assignments"
  ON public.user_areas FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage area assignments"
  ON public.user_areas FOR ALL
  USING (public.is_admin());

-- ============================================
-- CATEGORIES POLICIES
-- ============================================
CREATE POLICY "Authenticated users can view categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "Managers and admins can update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_manager_or_admin());

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================
-- INVENTORY_ITEMS POLICIES
-- ============================================
CREATE POLICY "Users can view items in their areas"
  ON public.inventory_items FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR 
    public.has_area_access(area_id)
  );

CREATE POLICY "Managers and admins can insert items"
  ON public.inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "Managers and admins can update items"
  ON public.inventory_items FOR UPDATE
  TO authenticated
  USING (public.is_manager_or_admin());

CREATE POLICY "Admins can delete items"
  ON public.inventory_items FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================
-- INVENTORY_TRANSACTIONS POLICIES
-- ============================================
CREATE POLICY "Users can view transactions for items in their areas"
  ON public.inventory_transactions FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.inventory_items i
      WHERE i.id = item_id AND public.has_area_access(i.area_id)
    )
  );

CREATE POLICY "Managers and admins can insert transactions"
  ON public.inventory_transactions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_manager_or_admin());

CREATE POLICY "Managers and admins can update transactions"
  ON public.inventory_transactions FOR UPDATE
  TO authenticated
  USING (public.is_manager_or_admin());

-- ============================================
-- DATABASE FUNCTIONS FOR APP LOGIC
-- ============================================

-- Get dashboard statistics
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalItems', COALESCE(SUM(quantity), 0),
    'totalValue', COALESCE(SUM(quantity * unit_price), 0),
    'lowStockCount', COUNT(*) FILTER (WHERE is_low_stock = true),
    'checkedOutCount', COUNT(*) FILTER (WHERE status = 'checked_out'),
    'availableCount', COUNT(*) FILTER (WHERE status = 'available'),
    'maintenanceCount', COUNT(*) FILTER (WHERE status = 'maintenance'),
    'retiredCount', COUNT(*) FILTER (WHERE status = 'retired'),
    'uniqueItemCount', COUNT(*)
  ) INTO result
  FROM public.inventory_items;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get category distribution
CREATE OR REPLACE FUNCTION public.get_category_distribution()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT 
        c.name,
        c.color,
        COUNT(i.id) as count,
        COALESCE(SUM(i.quantity * i.unit_price), 0) as value
      FROM public.categories c
      LEFT JOIN public.inventory_items i ON c.id = i.category_id
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.color
      ORDER BY count DESC
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get low stock items
CREATE OR REPLACE FUNCTION public.get_low_stock_items(limit_count INTEGER DEFAULT 10)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT 
        i.id,
        i.name,
        i.quantity as current,
        i.min_stock_level as minimum,
        c.name as category_name,
        a.name as area_name
      FROM public.inventory_items i
      LEFT JOIN public.categories c ON i.category_id = c.id
      LEFT JOIN public.areas a ON i.area_id = a.id
      WHERE i.is_low_stock = true AND i.status != 'retired'
      ORDER BY (i.quantity::float / NULLIF(i.min_stock_level, 0)) ASC
      LIMIT limit_count
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recent activity
CREATE OR REPLACE FUNCTION public.get_recent_activity(limit_count INTEGER DEFAULT 10)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT 
        t.id,
        t.transaction_type as action,
        i.name as item_name,
        p.name as user_name,
        t.created_at,
        t.quantity
      FROM public.inventory_transactions t
      LEFT JOIN public.inventory_items i ON t.item_id = i.id
      LEFT JOIN public.profiles p ON t.user_id = p.id
      ORDER BY t.created_at DESC
      LIMIT limit_count
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Issue item function
CREATE OR REPLACE FUNCTION public.issue_item(
  p_item_id UUID,
  p_user_id UUID,
  p_quantity INTEGER,
  p_expected_return_date TIMESTAMPTZ DEFAULT NULL,
  p_purpose TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_item RECORD;
  v_transaction_id UUID;
BEGIN
  -- Get item details
  SELECT * INTO v_item FROM public.inventory_items WHERE id = p_item_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Item not found');
  END IF;
  
  IF v_item.quantity < p_quantity THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient quantity available');
  END IF;
  
  IF v_item.status = 'retired' OR v_item.status = 'maintenance' THEN
    RETURN json_build_object('success', false, 'error', 'Item is not available for issue');
  END IF;
  
  -- Update item quantity
  UPDATE public.inventory_items
  SET 
    quantity = quantity - p_quantity,
    status = CASE WHEN quantity - p_quantity = 0 THEN 'checked_out' ELSE status END
  WHERE id = p_item_id;
  
  -- Create transaction record
  INSERT INTO public.inventory_transactions (
    item_id, transaction_type, quantity, user_id, issued_by,
    expected_return_date, purpose, notes, status
  ) VALUES (
    p_item_id, 'issue', p_quantity, p_user_id, auth.uid(),
    p_expected_return_date, p_purpose, p_notes, 'pending'
  ) RETURNING id INTO v_transaction_id;
  
  RETURN json_build_object(
    'success', true, 
    'transaction_id', v_transaction_id,
    'message', 'Item issued successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Return item function
CREATE OR REPLACE FUNCTION public.return_item(
  p_transaction_id UUID,
  p_quantity INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_transaction RECORD;
  v_return_qty INTEGER;
BEGIN
  -- Get transaction details
  SELECT * INTO v_transaction 
  FROM public.inventory_transactions 
  WHERE id = p_transaction_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Transaction not found');
  END IF;
  
  IF v_transaction.status = 'returned' THEN
    RETURN json_build_object('success', false, 'error', 'Item already returned');
  END IF;
  
  -- Determine return quantity
  v_return_qty := COALESCE(p_quantity, v_transaction.quantity);
  
  IF v_return_qty > v_transaction.quantity THEN
    RETURN json_build_object('success', false, 'error', 'Return quantity exceeds issued quantity');
  END IF;
  
  -- Update item quantity
  UPDATE public.inventory_items
  SET 
    quantity = quantity + v_return_qty,
    status = CASE WHEN status = 'checked_out' THEN 'available' ELSE status END
  WHERE id = v_transaction.item_id;
  
  -- Update transaction
  UPDATE public.inventory_transactions
  SET 
    actual_return_date = NOW(),
    status = CASE WHEN v_return_qty = quantity THEN 'returned' ELSE status END,
    notes = COALESCE(p_notes, notes)
  WHERE id = p_transaction_id;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Item returned successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA
-- ============================================

-- Default Areas (use only guaranteed columns: name, description)
INSERT INTO public.areas (name, description) VALUES
  ('Physics Lab', 'Physics laboratory equipment and supplies'),
  ('Chemistry Lab', 'Chemistry laboratory equipment and supplies'),
  ('Biology Lab', 'Biology laboratory equipment and supplies'),
  ('Computer Lab', 'Computer and IT equipment'),
  ('Library', 'Books, periodicals, and reading materials'),
  ('Sports Room', 'Sports equipment and gear'),
  ('Admin Office', 'Office supplies and equipment'),
  ('Storeroom', 'General storage and miscellaneous items')
ON CONFLICT (name) DO NOTHING;

-- Default Categories (use only guaranteed columns: name, description)
INSERT INTO public.categories (name, description) VALUES
  ('Electronics', 'Electronic devices and equipment'),
  ('Furniture', 'Desks, chairs, and other furniture'),
  ('Lab Equipment', 'Scientific instruments and lab tools'),
  ('Books & Materials', 'Books, textbooks, and learning materials'),
  ('Sports Equipment', 'Sports gear and fitness equipment'),
  ('Office Supplies', 'Stationery and office consumables'),
  ('Safety Equipment', 'Safety gear and protective equipment'),
  ('Audio Visual', 'Projectors, screens, and AV equipment')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- 1. After running this, create your first admin user:
--    a. Sign up via the app
--    b. In Supabase dashboard, go to Table Editor > profiles
--    c. Set role = 'admin' and is_active = true for that user
--
-- 2. Or run this SQL to make an existing user admin:
--    UPDATE public.profiles 
--    SET role = 'admin', is_active = true 
--    WHERE email = 'your-admin@kavyaschool.edu.np';
