# Sleep Screen - Cải tiến Giao Diện và Tính Năng

## 📋 Tóm tắt Thay đổi

Tôi đã cải thiện hoàn toàn giao diện Sleep Screen với những tính năng mới:

### ✨ Tính Năng Mới

1. **💾 Lưu Lịch Trình Thực Tế**
   - Giờ giác đồ (bedtime) và giờ thức dậy (wake up time) được lưu trực tiếp vào database
   - Dữ liệu persists và tự động tải lại khi mở app

2. **✏️ Chỉnh Sửa Giờ Giác Đồ**
   - Nhấn vào nút "Bedtime" hoặc "Wake up" để chỉnh sửa
   - Dùng nút +/- để điều chỉnh giờ và phút
   - Lưu tự động vào Supabase

3. **📊 Dữ Liệu Thực Từ Database**
   - Hiển thị dữ liệu giấc ngủ thực tế từ `daily_activity` table
   - Tính trung bình cộng giấc ngủ hàng tuần
   - Biểu đồ cột hiển thị giờ ngủ từng ngày

4. **🎨 Giao Diện Được Cải Thiện**
   - Design hiện đại với các thẻ (cards) đẹp mắt
   - Màu sắc sinh động: xanh dương (#00BCD4), đỏ (#EC4752), cam (#FF9800)
   - Layout responsive với shadow và elevation
   - Icon từ MaterialCommunityIcons

### 📁 Files Được Tạo/Sửa

#### 1. **services/sleepService.ts** (TẠO MỚI)
```typescript
- getSleepSchedule(userId) → Lấy lịch ngủ từ database
- updateSleepSchedule(userId, bedtime, wakeup_time) → Cập nhật lịch ngủ
- calculateDeepSleep(avgSleepHours) → Tính độ sâu giấc ngủ
- evaluateSleepQuality(avgSleepHours) → Đánh giá chất lượng (Poor/Fair/Good/Excellent)
- calculateScheduledSleep(bedtime, wakeup_time) → Tính thời gian ngủ theo lịch
```

#### 2. **screens/SleepScreen.tsx** (CẬP NHẬT)
Cải thiện hoàn toàn:
- Import `sleepService` để lấy và lưu dữ liệu
- State management cho giờ tạm thời (`tempHour`, `tempMinute`)
- `loadData()` hàm tải cả dữ liệu ngủ và lịch trình
- `handleSaveTime()` hàm lưu thay đổi vào database
- UI mới với các component:
  - **Header**: "Sleep Tracking" title
  - **Main Card**: Hiển thị trung bình giờ ngủ
  - **Weekly Chart**: Biểu đồ cột 7 ngày
  - **Stats Section**: Chất lượng ngủ + Deep Sleep
  - **Schedule Section**: Nút Bedtime/Wake up để chỉnh sửa
  - **Time Modal**: Modal chọn giờ/phút
  - **Recommendations**: Lời khuyên về giấc ngủ

### 🗄️ Yêu Cầu Database

Đảm bảo bảng `users` có các cột:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS sleep_bedtime TEXT DEFAULT '22:00';
ALTER TABLE users ADD COLUMN IF NOT EXISTS sleep_wakeup_time TEXT DEFAULT '07:00';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
```

Bảng `daily_activity` phải có:
- `user_id` (foreign key)
- `date` (ngày)
- `sleep_hours` (số giờ ngủ)

### 🎯 Cách Sử Dụng

1. **Xem dữ liệu giấc ngủ**: 
   - Tự động tải dữ liệu 7 ngày gần đây
   - Hiển thị biểu đồ, thống kê, và lời khuyên

2. **Chỉnh sửa giờ giác đồ**:
   - Tap vào nút "Bedtime" (màu đỏ) hoặc "Wake up" (màu cam)
   - Chọn giờ/phút bằng nút +/-
   - Tap "Save Time" để lưu

3. **Xem thời gian ngủ dự kiến**:
   - Thẻ xanh dương hiển thị thời gian từ bedtime đến wake up time

### 🔄 Luồng Dữ Liệu

```
User → SleepScreen
  ├─ useEffect → supabase.auth.getUser() → userId
  ├─ loadData()
  │  ├─ fetchDailyActivity(userId, "week") → sleepData
  │  └─ getSleepSchedule(userId) → bedtime, wakeup_time
  └─ UI render dữ liệu
  
User tap thay đổi giờ → handleSaveTime()
  └─ updateSleepSchedule() → Save to Supabase → Update state
```

### 🎨 Giao Diện Components

- **Header**: Tiêu đề + subtile
- **Main Card**: Badge xanh với chất lượng ngủ
- **Chart Card**: Biểu đồ cột với nhãn ngày
- **Stats**: 2 thẻ - Sleep Quality và Deep Sleep
- **Schedule**: 2 nút lớn (Bedtime/Wake up) + thẻ dự kiến thời gian
- **Modal**: Bottom sheet với time picker
- **Tips**: Lời khuyên về giấc ngủ

### ✅ Kiểm Tra

Đã verify:
- ✓ TypeScript compilation - không có error
- ✓ Imports đầy đủ
- ✓ Styles định nghĩa hoàn chỉnh
- ✓ Data binding đúng
- ✓ Modal functionality

### 🚀 Tiếp Theo (Tùy Chọn)

Có thể thêm:
- Notification alarm vào lúc bedtime/wake up
- Lịch sử chi tiết của từng đêm
- Thống kê theo tháng/quý
- Integration với health app
- Sleep tracking nâng cao (REM, deep, light sleep)
