/*
  HƯỚNG DẪN: Setup RLS Policies cho Supabase

  1. Vào Supabase Console
  2. Chọn project > SQL Editor
  3. Tạo policy cho bảng daily_activity
  4. Chạy các SQL sau:
*/

-- ============================================
-- 1. Bảng: daily_activity
-- ============================================

-- Policy: Allow users to SELECT their own activity
CREATE POLICY "Users can view their own activity"
ON public.daily_activity
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to INSERT their own activity
CREATE POLICY "Users can insert their own activity"
ON public.daily_activity
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to UPDATE their own activity
CREATE POLICY "Users can update their own activity"
ON public.daily_activity
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. Bảng: cycle_tracking
-- ============================================

-- Policy: Allow users to SELECT their own cycle data
CREATE POLICY "Users can view their own cycle"
ON public.cycle_tracking
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to INSERT their own cycle data
CREATE POLICY "Users can insert their own cycle"
ON public.cycle_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to UPDATE their own cycle data
CREATE POLICY "Users can update their own cycle"
ON public.cycle_tracking
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. Bảng: users (nếu cần)
-- ============================================

-- Policy: Allow users to SELECT their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- HƯỚNG DẪN TỪNG BƯỚC:
-- ============================================
/*
  Nếu muốn setup bằng UI Supabase:
  
  1. Vào Supabase Dashboard
  2. Click vào bảng "daily_activity"
  3. Ấn button "Auth" ở góc trên phải
  4. Nếu RLS chưa bật, click "Enable RLS"
  5. Click "New Policy" và chọn "For INSERT"
     - SET: user_id = auth.uid()
     - CHECK: user_id = auth.uid()
     - Ấn Create
  6. Làm tương tự cho SELECT, UPDATE
  7. Lặp lại với bảng cycle_tracking
  
  HOẶC chạy SQL trên SQL Editor của Supabase
*/
