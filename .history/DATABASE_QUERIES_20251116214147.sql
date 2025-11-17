-- Query test: Kiểm tra dữ liệu trong daily_activity
-- Chạy trong Supabase SQL Editor

-- 1. Xem tất cả records của user (thay USER_ID)
SELECT * FROM daily_activity 
WHERE user_id = 'USER_ID'
ORDER BY date DESC;

-- 2. Xem 7 ngày gần nhất (tuần)
SELECT date, steps, calories, heart_rate, sleep_hours 
FROM daily_activity 
WHERE user_id = 'USER_ID' 
  AND date >= CURRENT_DATE - INTERVAL '6 days'
ORDER BY date ASC;

-- 3. Xem 30 ngày gần nhất (tháng)
SELECT date, steps, calories, heart_rate, sleep_hours 
FROM daily_activity 
WHERE user_id = 'USER_ID' 
  AND date >= CURRENT_DATE - INTERVAL '29 days'
ORDER BY date ASC;

-- 4. Xem 90 ngày gần nhất (quý)
SELECT date, steps, calories, heart_rate, sleep_hours 
FROM daily_activity 
WHERE user_id = 'USER_ID' 
  AND date >= CURRENT_DATE - INTERVAL '89 days'
ORDER BY date ASC;

-- 5. Kiểm tra user nào có data
SELECT user_id, COUNT(*) as record_count, 
       MIN(date) as first_date, 
       MAX(date) as last_date
FROM daily_activity
GROUP BY user_id;

-- 6. Xem summary của user (tuần này)
SELECT 
  user_id,
  COUNT(*) as days_with_data,
  SUM(steps) as total_steps,
  AVG(steps) as avg_steps,
  MAX(steps) as max_steps,
  MIN(steps) as min_steps
FROM daily_activity
WHERE user_id = 'USER_ID'
  AND date >= CURRENT_DATE - INTERVAL '6 days'
GROUP BY user_id;

-- 7. Xem cycle_tracking data
SELECT user_id, start_date, average_length 
FROM cycle_tracking 
WHERE user_id = 'USER_ID'
ORDER BY start_date DESC;
