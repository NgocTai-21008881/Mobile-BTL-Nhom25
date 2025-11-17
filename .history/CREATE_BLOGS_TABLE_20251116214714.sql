-- CHECK & CREATE BLOGS TABLE (Nếu chưa có)
-- Chạy trong Supabase SQL Editor

-- ===== KIỂM TRA STRUCTURE =====
-- Xem cấu trúc hiện tại của blogs table
\d blogs

-- Hoặc:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'blogs' 
ORDER BY ordinal_position;

-- ===== NẾुU CHƯA CÓ TABLE, TẠO NGAY =====
-- (Nếu blogs table đã tồn tại, bỏ qua phần này)

CREATE TABLE IF NOT EXISTS blogs (
    id BIGSERIAL PRIMARY KEY,
    tieude VARCHAR(255) NOT NULL,
    hinhanh TEXT NOT NULL,
    loai VARCHAR(50) NOT NULL,
    luongxem INTEGER DEFAULT 0,
    ngaytao TIMESTAMP DEFAULT NOW(),
    noidung TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== TẠO INDEX ĐỂ TỐC ĐỘ =====
CREATE INDEX IF NOT EXISTS idx_blogs_loai ON blogs(loai);
CREATE INDEX IF NOT EXISTS idx_blogs_ngaytao ON blogs(ngaytao DESC);

-- ===== BẬT RLS (OPTIONAL) =====
-- Nếu muốn bảo vệ, tạo policy cho public read-only
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policy: Ai cũng có thể đọc
CREATE POLICY "Allow public read" ON blogs
    FOR SELECT
    USING (true);

-- Policy: Chỉ admin có thể insert/update/delete
CREATE POLICY "Allow admin write" ON blogs
    FOR INSERT
    WITH CHECK (auth.uid() = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Allow admin update" ON blogs
    FOR UPDATE
    USING (auth.uid() = '00000000-0000-0000-0000-000000000000');

-- ===== KIỂM TRA BẢNG =====
SELECT COUNT(*) as total_blogs FROM blogs;
SELECT DISTINCT loai FROM blogs;
SELECT * FROM blogs LIMIT 5;

-- ===== THỐNG KÊ =====
SELECT loai, COUNT(*) as count, 
       ROUND(AVG(luongxem)) as avg_views,
       SUM(luongxem) as total_views
FROM blogs
GROUP BY loai
ORDER BY total_views DESC;

-- ===== REFRESH MATERIALIZED VIEW (Nếu có cache) =====
-- REFRESH MATERIALIZED VIEW mv_blog_stats;
