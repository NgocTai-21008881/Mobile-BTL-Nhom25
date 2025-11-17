/**
 * 📊 DEMO: Cách Chart Logic Hoạt Động
 * 
 * Scenario: User nhấp "Tháng" thay vì "Tuần"
 */

// ============== TRƯỚC ==============
// 1. Component state (TRƯỚC)
graphData = [];
labels = [];
selectedRange = "week";  // User nhấp "Tháng" button
loading = false;

// ============== KÍCH HOẠT ==============
// 2. User nhấp button "Tháng"
// <TouchableOpacity onPress={() => setSelectedRange("month")} />

// 3. setSelectedRange("month") được gọi
selectedRange = "month";  // ← State change!

// ============== useEffect PHÁT HIỆN ==============
// 4. useEffect dependency array: [selectedRange, userId]
useEffect(() => {
    if (!userId) return;
    loadData(selectedRange);  // ← Được gọi!
}, [selectedRange, userId]);  // ← selectedRange changed!

// ============== LOAD DATA ==============
// 5. loadData("month") được execute

setLoading(true);  // ← Loading indicator appears
console.log(`📊 Loading data for range: month`);

// 6. Gọi fetchDailyActivity
const data = await fetchDailyActivity(userId, "month");
//                                           ↑
//                    function parameters: range = "month"

// ============== TRONG fetchDailyActivity ==============
// 7. Tính date range
const today = new Date();                    // 2025-11-16
const startDate = new Date(today);
startDate.setDate(today.getDate() - 29);    // 2025-10-17

const startStr = "2025-10-17";
const todayStr = "2025-11-16";

console.log(`🔍 fetchDailyActivity - userId: abc123, range: month`);
console.log(`📅 Date range: 2025-10-17 to 2025-11-16`);

// 8. Query Supabase
const { data } = await supabase
    .from("daily_activity")
    .select("date, steps, calories, heart_rate, sleep_hours")
    .eq("user_id", "abc123")
    .gte("date", "2025-10-17")
    .lte("date", "2025-11-16")
    .order("date", { ascending: true });

// Returns:
// [
//   { date: "2025-10-17", steps: 8234, ... },
//   { date: "2025-10-18", steps: 12340, ... },
//   { date: "2025-10-19", steps: 5678, ... },
//   ...
//   { date: "2025-11-16", steps: 11857, ... },
// ]
// Total: 30 records

console.log(`✅ Fetched 30 records`);

// ============== BACK TO loadData ==============
// 9. Xử lý data trong loadData

const steps = data.map((d) => d.steps || 0);
// = [8234, 12340, 5678, ..., 11857]

setGraphData(steps);  // ← State updated!

// 10. Generate labels
const dayLabels = data.map((d) => {
    const date = new Date(d.date);  // "2025-10-17"
    // range = "month", vì vậy:
    return date.getDate().toString();  // "17"
    // → Cho tất cả: ["17", "18", "19", ..., "16"]
});

setLabels(dayLabels);  // ← State updated!

console.log(`📈 Steps: [8234, 12340, 5678, ..., 11857]`);
console.log(`📋 Labels: [17, 18, 19, ..., 16]`);

setLoading(false);  // ← Loading indicator disappears

// ============== AFTER ==============
// 11. Component state (AFTER)
graphData = [8234, 12340, 5678, ..., 11857];  // 30 values
labels = ["17", "18", "19", ..., "16"];        // 30 labels
selectedRange = "month";
loading = false;

// ============== COMPONENT RE-RENDER ==============
// 12. React detects state changes → Re-render

// 13. Chart component renders
graphData.map((v, i) => {
    const h = Math.max(8, (v / maxVal) * 120);
    // Draw bar with height h
    // Display label[i] below
});

// 14. Result
// ┌─────────────────────────┐
// │ Chart (30 bars)         │
// │ ┃ ┃ ┃ ┃ ┃ ... ┃         │  ← Heights = steps values
// │ 17 18 19 20 ... 16      │  ← Labels = dates
// └─────────────────────────┘

// ============== STATS UPDATE ==============
// 15. useMemo recalculates stats
const maxVal = Math.max(goal, ...graphData);
// = Math.max(10000, 8234, 12340, 5678, ..., 11857)
// = 12340

const total = graphData.reduce((a, b) => a + b, 0);
// = 8234 + 12340 + 5678 + ... + 11857
// = 285,000

const avg = Math.round(total / graphData.length);
// = 285,000 / 30
// = 9,500

const progress = Math.min(1, avg / goal);
// = 9,500 / 10,000
// = 0.95  (95% progress bar)

// ============== UI UPDATE ==============
// 16. UI displays updated values
{
    <Text>{avg}</Text>  {/* "9,500" */}
    <View style={{width: `${progress * 100}%`}} />  {/* 95% bar */}
}

// ============= EXPECTED VISUAL RESULT =============
/*
┌─────────────────────────────────────┐
│ Số Bước                             │
├─────────────────────────────────────┤
│  [Tuần] [Tháng] [Quý]              │  ← Tháng is selected
├─────────────────────────────────────┤
│ 🔄 Cập nhật dữ liệu...             │  ← Loading indicator (brief)
├─────────────────────────────────────┤
│ Trung bình                          │
│ 9,500                               │  ← Updated value!
│ ████████████████████░              │  ← 95% progress
│ Mục tiêu: 10,000 bước              │
├─────────────────────────────────────┤
│ Chart with 30 bars (Oct 17-Nov 16) │  ← 30 days!
│ ┃ ┃ ┃ ┃ ┃ ... ┃ ┃ ┃ ┃             │
│ 17 18 19 20 21... 14 15 16         │  ← Day numbers
└─────────────────────────────────────┘
*/

/**
 * 🎯 KEY POINTS:
 * 
 * 1. Dependency Array [selectedRange, userId]
 *    → Khi selectedRange thay đổi → useEffect trigger
 * 
 * 2. loadData async function
 *    → setLoading(true) → Fetch → setLoading(false)
 * 
 * 3. Date calculation
 *    → range="week" → 6 days ago
 *    → range="month" → 29 days ago
 *    → range="quarter" → 89 days ago
 * 
 * 4. Label logic
 *    → week: Convert getDay() to "T2"-"CN"
 *    → month/quarter: Show day of month (1-31)
 * 
 * 5. Stats calculation (useMemo)
 *    → Total = sum of all steps
 *    → Average = total / days
 *    → Progress = avg / goal
 *    → Re-calculates when graphData changes
 * 
 * 6. State flow
 *    graphData → Chart renders
 *    labels → Chart X-axis
 *    loading → Show/hide indicator
 *    selectedRange → Controls range button active state
 *    avg, maxVal, progress → Stats display
 */
