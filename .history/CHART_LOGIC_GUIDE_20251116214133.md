# 📊 Hướng Dẫn Logic Chart - Số Bước

## 🎯 Những gì đã được cải thiện

### 1. **Cơ chế Tự Động Cập Nhật Chart**
Khi bạn nhấp vào **Tuần**, **Tháng**, hoặc **Quý**, screen sẽ:

```
Tuần → Fetch 7 ngày gần nhất
Tháng → Fetch 30 ngày gần nhất  
Quý → Fetch 90 ngày gần nhất
```

**Quy trình:**
1. User nhấp button (Tuần/Tháng/Quý)
2. `selectedRange` state thay đổi
3. `useEffect` phát hiện thay đổi → gọi `loadData(selectedRange)`
4. `loadData()` gọi `fetchDailyActivity(userId, range)` từ database
5. Data được parse thành `graphData` (mảng steps) + `labels` (ngày/tháng)
6. Chart component re-render với data mới

### 2. **Loading Indicator**
Khi data đang được fetch:
- **Full-screen loader** → Nếu lần đầu load (graphData rỗng)
- **Inline indicator** → Nếu đang switch range (data cũ vẫn hiển thị)

```tsx
// Inline loading indicator - hiển thị khi switching range
{loading && (
    <View style={styles.loadingIndicator}>
        <ActivityIndicator size="small" color="#5865F2" />
        <Text style={styles.loadingText}>Cập nhật dữ liệu...</Text>
    </View>
)}
```

### 3. **Console Logging**
Bạn có thể mở DevTools để xem quá trình load:

**Trong DoubleSupportScreen:**
```
📊 Loading data for range: week
✅ Data loaded (week): [...]
📈 Steps: [11857, 12000, ...]
📋 Labels: [T2, T3, T4, ...]
```

**Trong activityService:**
```
🔍 fetchDailyActivity - userId: abc123, range: week
📅 Date range: 2025-11-09 to 2025-11-16
✅ Fetched 7 records
```

## 🧪 Cách Test

### Test 1: Basic Range Switching
```
1. Mở app → Đăng nhập
2. Vào Double Support Screen (Số Bước)
3. Quan sát chart hiển thị 7 ngày với labels T2-CN
4. Nhấp "Tháng" → Chart phải update với 30 ngày
5. Nhấp "Quý" → Chart phải update với 90 ngày
6. Nhấp "Tuần" lại → Chart quay về 7 ngày
```

### Test 2: Data Calculation
```
1. Chọn "Tuần"
2. Tính tổng steps từ chart: ví dụ 50,000
3. Kiểm tra "Trung bình" = 50,000 ÷ 7 ≈ 7,143 bước
4. Progress bar nên fill theo: avg ÷ goal
   - Nếu avg=7,143, goal=10,000 → Progress ≈ 71%
```

### Test 3: Multi-User Data
```
1. Đăng nhập Account A
2. Ghi nhận data hiển thị
3. Logout
4. Đăng nhập Account B
5. Double Support Screen phải hiển thị data khác (B)
6. Logout → Đăng nhập Account A
7. Data của A phải được load lại (không phải B)
```

### Test 4: No Data Scenario
```
1. Tạo account mới (không có data)
2. Vào Double Support Screen
3. Full-screen loader phải hiển thị
4. Sau khi load xong → chart trống + "Trung bình: 0"
```

## 🔧 Debugging Tips

### Nếu chart không update khi switch range:
1. Mở Chrome DevTools (F12)
2. Kiểm tra Console có logs không:
   - `📊 Loading data for range: ...` ✅
   - `✅ Data loaded ...` ✅
   - Nếu không → Check network tab
3. Kiểm tra Supabase:
   - Có record nào cho `user_id` này không?
   - Có RLS policy blocking SELECT không?

### Nếu chart hiển thị sai values:
1. Console log `graphData` array:
   ```tsx
   console.log("graphData:", graphData);
   ```
2. Kiểm tra database có data không:
   - Supabase Console → daily_activity
   - Filter by `user_id` của test account
   - Verify `steps` column có values

### Nếu labels sai:
1. Kiểm tra cách calculate day of week:
   ```
   date.getDay() → 0=CN, 1=T2, ..., 6=T7
   Mảng: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
   ```
2. Nếu labels toàn số (1, 2, 3...) → Range là "month" hoặc "quý" ✅

## 📋 Code Structure

```
DoubleSupportScreen.tsx
├── State
│   ├── graphData: number[]      ← Steps data từ DB
│   ├── labels: string[]         ← Ngày/tháng labels
│   ├── selectedRange: RangeKey  ← "week" | "month" | "quarter"
│   └── loading: boolean         ← Fetch status
├── Effects
│   ├── useEffect (userId)       ← Get current user
│   └── useEffect (selectedRange, userId) ← Load data khi range change
├── Functions
│   └── loadData(range)          ← Fetch từ DB, update state
└── UI
    ├── Range buttons
    ├── Chart (re-renders when graphData change)
    └── Stats cards (tính từ graphData)

activityService.ts
└── fetchDailyActivity(userId, range)
    ├── Tính date range (startDate → today)
    ├── Query Supabase
    └── Return array of { date, steps, ... }
```

## ✅ Checklist

- [ ] Chart cập nhật khi nhấp Tuần/Tháng/Quý
- [ ] Loading indicator hiển thị khi fetch data
- [ ] Console logs rõ ràng về quá trình
- [ ] Trung bình steps tính đúng
- [ ] Labels hiển thị đúng (T2-CN cho tuần, số cho tháng)
- [ ] Multi-user data isolation hoạt động
- [ ] Không có error trong Chrome DevTools

---

**Cần help?** 
- Check Chrome DevTools → Console tab
- Xem Supabase database có data không
- Kiểm tra RLS policies cho `daily_activity` table
