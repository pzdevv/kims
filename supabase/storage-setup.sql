-- Supabase Storage Configuration for KIMS
-- **IMPORTANT**: Run schema.sql FIRST before running this file!
-- Or run this simplified version that doesn't depend on custom functions.

-- ============================================
-- CREATE STORAGE BUCKET
-- ============================================

-- Create the inventory-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inventory-images',
  'inventory-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Allow anyone to view images (public bucket)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inventory-images');

-- Allow authenticated users to upload images
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'inventory-images');

-- Allow authenticated users to update their uploaded images
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
CREATE POLICY "Authenticated users can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'inventory-images');

-- Allow authenticated users to delete images
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
CREATE POLICY "Authenticated users can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'inventory-images');

-- ============================================
-- NOTES
-- ============================================
-- 1. The bucket is set to public so images can be viewed without authentication
-- 2. Only authenticated users can upload, update, and delete images
-- 3. Maximum file size is 5MB
-- 4. Only JPEG, PNG, WebP, and GIF images are allowed
--
-- If you want stricter policies (only managers/admins can update/delete):
-- Run schema.sql first, then use these policies instead:
--
-- CREATE POLICY "Managers can update images"
--   ON storage.objects FOR UPDATE
--   TO authenticated
--   USING (bucket_id = 'inventory-images' AND public.is_manager_or_admin());
--
-- CREATE POLICY "Managers can delete images"
--   ON storage.objects FOR DELETE
--   TO authenticated
--   USING (bucket_id = 'inventory-images' AND public.is_manager_or_admin());
