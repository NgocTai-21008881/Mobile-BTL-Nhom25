-- INSERT BLOG DATA - Supabase SQL Editor
-- Chạy script này để thêm dữ liệu blog vào database

-- 🗑️ OPTIONAL: Xóa dữ liệu cũ
-- DELETE FROM blogs WHERE id > 0;

-- ✅ THÊM BLOG DATA
INSERT INTO blogs (tieude, hinhanh, loai, luongxem, ngaytao, noidung) VALUES
-- ===== BLOGS ABOUT STEPS & WALKING =====
(
  'Đi Bộ 10,000 Bước Mỗi Ngày - Bí Quyết Sống Lâu',
  'https://images.unsplash.com/photo-1552196881-acbed25f4b34?w=500&h=300&fit=crop',
  'Bước',
  2145,
  NOW() - INTERVAL '15 days',
  'Đi bộ là hoạt động tập thể dục đơn giản nhưng hiệu quả cao. Mục tiêu 10,000 bước mỗi ngày giúp cải thiện sức khỏe tim mạch, giảm cân và tăng sức bền. Bài viết này hướng dẫn cách bắt đầu và duy trì thói quen này.'
),
(
  'Cách Tính Calories Đốt Cháy Khi Đi Bộ',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop',
  'Bước',
  1856,
  NOW() - INTERVAL '12 days',
  'Không phải lúc nào bạn cũng biết mình đốt cháy bao nhiêu calories khi đi bộ. Tốc độ, trọng lượng cơ thể và địa hình đều ảnh hưởng. Học cách tính toán chính xác để đạt mục tiêu giảm cân.'
),
(
  'Kiểm Tra Sự Kiện Tim Đập Nhanh Lúc Tập Luyện',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&h=300&fit=crop',
  'Nhịp Tim',
  3421,
  NOW() - INTERVAL '10 days',
  'Nhịp tim là chỉ số quan trọng để theo dõi sức khỏe. Khi tập luyện, nhịp tim tăng lên là bình thường. Hiểu rõ về vùng nhịp tim tối ưu giúp bạn tập luyện hiệu quả và an toàn.'
),

-- ===== BLOGS ABOUT CALORIES & NUTRITION =====
(
  'Thế Nào Là Một Bữa Ăn Cân Bằng Dinh Dưỡng?',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop',
  'Dinh Dưỡng',
  2987,
  NOW() - INTERVAL '8 days',
  'Một bữa ăn cân bằng phải chứa protein, carbohydrate, chất béo lành mạnh, và rau quả. Bài viết này giải thích tỷ lệ lý tưởng và cách xây dựng bữa ăn hoàn hảo cho sức khỏe.'
),
(
  '1000 Calories Mỗi Ngày - Có An Toàn Không?',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=300&fit=crop',
  'Dinh Dưỡng',
  4156,
  NOW() - INTERVAL '5 days',
  'Chế độ ăn 1000 calories rất hạn chế và có thể gây hại nếu kéo dài. Tìm hiểu nhu cầu calories cá nhân và cách giảm cân an toàn, bền vững mà không cảm thấy đói khát.'
),
(
  'Snacks Lành Mạnh Cho Người Tập Gym',
  'https://images.unsplash.com/photo-1599599810694-b5ac73eb988b?w=500&h=300&fit=crop',
  'Dinh Dưỡng',
  1654,
  NOW() - INTERVAL '3 days',
  'Sau khi tập gym, cơ thể cần dinh dưỡng để phục hồi. Khám phá những snacks ngon, lành mạnh, giàu protein giúp phục hồi cơ bắp nhanh hơn.'
),

-- ===== BLOGS ABOUT SLEEP =====
(
  'Tại Sao Ngủ 8 Tiếng Rất Quan Trọng?',
  'https://images.unsplash.com/photo-1541961017774-22e528fc0842?w=500&h=300&fit=crop',
  'Giấc Ngủ',
  3298,
  NOW() - INTERVAL '7 days',
  'Giấc ngủ chất lượng là nền tảng của sức khỏe tốt. Bài viết này giải thích tại sao 8 tiếng ngủ lý tưởng, ảnh hưởng của thiếu ngủ và cách cải thiện chất lượng giấc ngủ.'
),
(
  'Mẹo Ngủ Ngon Tự Nhiên Mà Không Cần Thuốc',
  'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=500&h=300&fit=crop',
  'Giấc Ngủ',
  2876,
  NOW() - INTERVAL '2 days',
  'Nếu bạn gặp khó khăn khi ngủ, thử các mẹo tự nhiên: yoga trước khi ngủ, hạn chế caffeine, giữ phòng mát mẻ, và tạo thói quen trước giấc ngủ.'
),
(
  'Chu Kỳ Giấc Ngủ REM và NREM - Hiểu Rõ Hơn',
  'https://images.unsplash.com/photo-1606041008023-472debaf5381?w=500&h=300&fit=crop',
  'Giấc Ngủ',
  2134,
  NOW() - INTERVAL '1 day',
  'Giấc ngủ không phải là trạng thái đơn nhất. REM và NREM là hai giai đoạn quan trọng. Tìm hiểu chu kỳ giấc ngủ và tại sao mỗi giai đoạn đều cần thiết.'
),

-- ===== BLOGS ABOUT CYCLE TRACKING =====
(
  'Tìm Hiểu Chu Kỳ Kinh Nguyệt - Hướng Dẫn Hoàn Chỉnh',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=300&fit=crop',
  'Chu Kỳ',
  5234,
  NOW() - INTERVAL '6 days',
  'Hiểu rõ chu kỳ kinh nguyệt của bạn giúp dự đoán được các giai đoạn khác nhau và tự chăm sóc tốt hơn. Bài viết này giải thích chi tiết về các pha chu kỳ và các triệu chứng.'
),
(
  'Cách Theo Dõi Chu Kỳ Bằng Ứng Dụng - Dễ Hơn Bạn Tưởng',
  'https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=500&h=300&fit=crop',
  'Chu Kỳ',
  3876,
  NOW() - INTERVAL '4 days',
  'Ứng dụng theo dõi chu kỳ giúp bạn quản lý thông tin sức khỏe một cách chuyên nghiệp. Tìm hiểu cách sử dụng app để dự đoán ngày kinh, tìm ngày an toàn, và theo dõi triệu chứng.'
),
(
  'Những Hoạt Động Nên Tránh Trong Thời Kỳ Kinh',
  'https://images.unsplash.com/photo-1623188033956-3c6ba8c5b6a6?w=500&h=300&fit=crop',
  'Chu Kỳ',
  2145,
  NOW() - INTERVAL '9 days',
  'Trong kỳ kinh, cơ thể cần chăm sóc đặc biệt. Một số hoạt động có thể gây khó chịu hoặc ảnh hưởng đến sức khỏe. Khám phá những hoạt động nên tránh và những cách thay thế lành mạnh.'
),

-- ===== BLOGS ABOUT GENERAL HEALTH =====
(
  'Thói Quen Sáng Lành Mạnh Để Bắt Đầu Ngày',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=300&fit=crop',
  'Sức Khỏe',
  4521,
  NOW() - INTERVAL '11 days',
  'Cách bạn bắt đầu ngày ảnh hưởng đến toàn bộ năng suất và sức khỏe. Thử các thói quen sáng như yoga, uống nước ấm với chanh, thiền, hoặc tập thể dục nhẹ.'
),
(
  'Căng Thẳng và Tác Động Đến Sức Khỏe - Cách Kiểm Soát',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&h=300&fit=crop',
  'Sức Khỏe',
  3345,
  NOW() - INTERVAL '13 days',
  'Căng thẳng kéo dài gây hại cho cơ thể và tâm trí. Tìm hiểu các kỹ thuật quản lý căng thẳng hiệu quả: thiền định, yoga,呼吸 sâu, và hoạt động ngoài trời.'
),
(
  'Tầm Quan Trọng Của Nước - Uống Đủ Nước Mỗi Ngày',
  'https://images.unsplash.com/photo-1606787620217-e17c4f4f2242?w=500&h=300&fit=crop',
  'Sức Khỏe',
  2876,
  NOW() - INTERVAL '14 days',
  'Nước chiếm 60% cơ thể bạn. Uống đủ nước giúp điều hòa nhiệt độ, vận chuyển chất dinh dưỡng, và loại bỏ chất thải. Tìm hiểu công thức tính lượng nước cần uống mỗi ngày.'
);

-- ✅ KIỂM TRA LẠI DỮ LIỆU
SELECT COUNT(*) as total_blogs FROM blogs;

SELECT tieude, loai, luongxem, ngaytao FROM blogs ORDER BY ngaytao DESC LIMIT 5;
