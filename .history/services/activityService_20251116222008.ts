import { supabase } from "../lib/supabase";

export type RangeKey = "week" | "month" | "quarter";

export async function fetchDailyActivity(userId: string, range: RangeKey) {
    try {
        const today = new Date();
        const startDate = new Date(today);

        if (range === "week") startDate.setDate(today.getDate() - 6);
        else if (range === "month") startDate.setDate(today.getDate() - 29);
        else startDate.setDate(today.getDate() - 89);

        // Format dates as YYYY-MM-DD
        const formatDate = (d: Date) => d.toISOString().split("T")[0];
        const startStr = formatDate(startDate);
        const todayStr = formatDate(today);

        console.log(
            `🔍 fetchDailyActivity - userId: ${userId}, range: ${range}`
        );
        console.log(`📅 Date range: ${startStr} to ${todayStr}`);

        const { data, error } = await supabase
            .from("daily_activity")
            .select("date, steps, calories, heart_rate, sleep_hours")
            .eq("user_id", userId)
            .gte("date", startStr)
            .lte("date", todayStr)
            .order("date", { ascending: true });

        if (error) {
            console.error(`❌ Supabase error: ${error.message}`);
            throw error;
        }

        console.log(`✅ Fetched ${data?.length || 0} records`);
        return data || [];
    } catch (e) {
        console.error("❌ Lỗi tải dữ liệu hoạt động:", e);
        return [];
    }
}

// Lấy dữ liệu hôm nay
export async function getTodayActivity(userId: string) {
    try {
        const today = new Date().toISOString().split("T")[0];
        console.log("📅 getTodayActivity - userId:", userId, "date:", today);

        const { data, error } = await supabase
            .from("daily_activity")
            .select("steps, calories, heart_rate, sleep_hours")
            .eq("user_id", userId)
            .eq("date", today)
            .single();

        console.log("📊 getTodayActivity result:", { data, error });

        if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
        return data || { steps: 0, calories: 0, heart_rate: 0, sleep_hours: 0 };
    } catch (e) {
        console.error("❌ Lỗi lấy dữ liệu hôm nay:", e);
        return { steps: 0, calories: 0, heart_rate: 0, sleep_hours: 0 };
    }
}

// Lấy tổng dữ liệu tuần
export async function getWeeklyStats(userId: string) {
    try {
        console.log("📊 getWeeklyStats - userId:", userId);

        const data = await fetchDailyActivity(userId, "week");
        console.log("📈 fetchDailyActivity result:", data);

        const totalSteps = data.reduce(
            (sum, item) => sum + (item.steps || 0),
            0
        );
        const totalCalories = data.reduce(
            (sum, item) => sum + (item.calories || 0),
            0
        );
        const totalSleep = data.reduce(
            (sum, item) => sum + (item.sleep_hours || 0),
            0
        );
        const avgHeartRate =
            data.length > 0
                ? Math.round(
                      data.reduce(
                          (sum, item) => sum + (item.heart_rate || 0),
                          0
                      ) / data.length
                  )
                : 0;

        // Chuyển giờ thành h m format
        const sleepHours = Math.floor(totalSleep);
        const sleepMinutes = Math.round((totalSleep - sleepHours) * 60);

        const result = {
            steps: totalSteps,
            workout: 0, // Cập nhật nếu có bảng workout riêng
            water: 0, // Cập nhật nếu có bảng water riêng
            sleep: `${sleepHours}h ${sleepMinutes}min`,
        };

        console.log("✅ Weekly stats result:", result);
        return result;
    } catch (e) {
        console.error("❌ Lỗi lấy stats tuần:", e);
        return { steps: 0, workout: 0, water: 0, sleep: "0h 0min" };
    }
}

// Lấy dữ liệu theo tháng năm cụ thể
export async function fetchActivityByMonthYear(
    userId: string,
    month: number,
    year: number
) {
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const formatDate = (d: Date) => d.toISOString().split("T")[0];
        const startStr = formatDate(startDate);
        const endStr = formatDate(endDate);

        console.log(
            `🔍 fetchActivityByMonthYear - userId: ${userId}, month: ${month}, year: ${year}`
        );
        console.log(`📅 Date range: ${startStr} to ${endStr}`);

        const { data, error } = await supabase
            .from("daily_activity")
            .select("date, steps, calories, heart_rate, sleep_hours")
            .eq("user_id", userId)
            .gte("date", startStr)
            .lte("date", endStr)
            .order("date", { ascending: true });

        if (error) {
            console.error(`❌ Supabase error: ${error.message}`);
            throw error;
        }

        console.log(`✅ Fetched ${data?.length || 0} records for month`);
        return data || [];
    } catch (e) {
        console.error("❌ Lỗi tải dữ liệu hoạt động theo tháng:", e);
        return [];
    }
}

// Thêm hoạt động mới
export async function addDailyActivity(
    userId: string,
    date: string,
    steps: number,
    calories?: number,
    heart_rate?: number,
    sleep_hours?: number
) {
    try {
        const { data, error } = await supabase
            .from("daily_activity")
            .upsert([
                {
                    user_id: userId,
                    date,
                    steps,
                    calories: calories ?? 0,
                    heart_rate: heart_rate ?? 0,
                    sleep_hours: sleep_hours ?? 0,
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return { error: null, data };
    } catch (e: any) {
        return { error: e.message, data: null };
    }
}
