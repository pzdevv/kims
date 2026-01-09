-- ============================================================
-- PRODUCTION FIX: Auto-create profiles on user signup
-- This uses a trigger that runs with elevated privileges
-- ============================================================

-- Step 1: Create the function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, department, phone, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'manager'),
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'phone',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    department = COALESCE(EXCLUDED.department, profiles.department),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Also handle user updates (for user metadata changes)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    role = COALESCE(NEW.raw_user_meta_data->>'role', profiles.role),
    department = COALESCE(NEW.raw_user_meta_data->>'department', profiles.department),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', profiles.phone),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.handle_user_update();

-- Step 5: Backfill any existing auth users who don't have profiles
INSERT INTO public.profiles (id, email, name, role, is_active, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'role', 'manager'),
  true,
  NOW(),
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

SELECT 'SUCCESS: Profile auto-creation trigger installed!' as result;
