-- ========================================
-- FIX RLS Policy để Allow Insert khi Signup
-- ========================================
-- Chạy script này nếu bạn gặp lỗi insert

-- ========================================
-- 1. Kiểm tra RLS status
-- ========================================
-- Xem RLS có enable không
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- ========================================
-- 2. Drop policies cũ (nếu cần fix)
-- ========================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- ========================================
-- 3. Create policies mới (cho phép insert)
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

-- Policy 3: Allow anonymous insert (khi signup, chưa có session)
CREATE POLICY "Allow insert during signup"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- ========================================
-- 4. Verify policies
-- ========================================
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Expected output: 3 policies
-- - Users can view own profile
-- - Users can update own profile
-- - Allow insert during signup

-- ========================================
-- 5. Test insert (nếu muốn test manual)
-- ========================================
-- INSERT INTO public.users (id, email, username) 
-- VALUES (gen_random_uuid(), 'test@example.com', 'testuser');

-- SELECT * FROM public.users;
