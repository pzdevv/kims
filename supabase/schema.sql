-- Kavya Inventory Management System - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_areas ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- FIX: Avoid infinite recursion by checking auth.jwt() or avoiding self-select for admin check
-- We will use a more direct approach: Users can view own. Admins (filtered by the query itself?)
-- Actually, the standard pattern for "Admins can view all" often uses a helper function or JWT claim.
-- Since we don't have custom claims set up easily without Edge Functions, we will use a SECURITY DEFINER function to check admin status.

-- Helper function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Use the security definer function to break recursion
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Users can insert their own profile on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Areas policies (everyone can view, admins can modify)
CREATE POLICY "Everyone can view areas"
  ON public.areas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert areas"
  ON public.areas FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update areas"
  ON public.areas FOR UPDATE
  USING (public.is_admin());

-- User areas policies
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
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SEED DATA - Default Areas
-- ============================================
INSERT INTO public.areas (name, description) VALUES
  ('Physics Lab', 'Physics laboratory equipment'),
  ('Chemistry Lab', 'Chemistry laboratory equipment'),
  ('Biology Lab', 'Biology laboratory equipment'),
  ('Computer Lab', 'Computer and IT equipment'),
  ('Library', 'Books and reading materials'),
  ('Sports Room', 'Sports equipment and gear'),
  ('Admin Office', 'Office supplies and equipment'),
  ('Storeroom', 'General storage')
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
