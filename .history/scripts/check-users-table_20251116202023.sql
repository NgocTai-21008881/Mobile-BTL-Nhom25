-- ========================================
-- BƯỚC 2: Kiểm tra bảng users
-- ========================================

-- 2.1 Xem schema của bảng users
\d public.users

-- 2.2 Xem tất cả data trong bảng
SELECT * FROM public.users;

-- 2.3 Đếm số lượng users
SELECT COUNT(*) as total_users FROM public.users;

-- 2.4 Kiểm tra columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users';
