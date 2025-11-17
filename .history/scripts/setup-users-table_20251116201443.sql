-- ========================================
-- Setup Users Table & Trigger for Supabase
-- ========================================
-- Chạy script này trong Supabase SQL Editor
-- Dashboard → SQL Editor → Tạo query mới → Copy-Paste tất cả code dưới

-- ========================================
-- 1. Tạo bảng users
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- 2. Enable RLS (Row Level Security)
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. Create RLS Policies
-- ========================================
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow insert during signup (will be done via trigger)
CREATE POLICY "Service role can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- ========================================
-- 4. Create or Replace trigger function
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. Create trigger
-- ========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 6. Create updated_at trigger
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- 7. Create Indexes for Performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- ========================================
-- DONE! Bạn đã setup thành công
-- ========================================
-- Giờ bạn có thể:
-- 1. Đăng ký user mới → Tự thêm vào bảng users
-- 2. Query user profile từ bảng users
-- 3. Update profile của user
--
-- Kiểm tra: SELECT * FROM public.users;
-- ========================================
