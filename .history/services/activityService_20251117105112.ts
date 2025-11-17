// services/activityService.ts
import { supabase } from "../lib/supabase";

export type RangeKey = "week" | "month" | "quarter";

export interface DailyActivity {
    date: string;
    steps?: number;
    calories?: number;
    heart_rate?: number;
    sleep_hours?: number;
}

/**
 * Lấy dữ liệu hoạt động theo khoảng thời gian
 */
export async function fetchDailyActivity(
    userId: string,
    range: RangeKey
): Promise<DailyActivity[]> {
    try {
        const today = new Date();
        const startDate = new Date(today);

        if (range === "week") startDate.setDate(today.getDate() - 6);
        else if (range === "month") startDate.setDate(today.getDate() - 29);
        else startDate.setDate(today.getDate() - 89);

        const formatDate = (d: Date) => d.toISOString().split("T")[0];
        const startStr = formatDate(startDate);
        const todayStr = formatDate(today);

        const { data, error } = await supabase
            .from("daily_activity")
            .select("date, steps, calories, heart_rate, sleep_hours")
            .eq("user_id", userId)
            .gte("date", startStr)
            .lte("date", todayStr)
            .order("date", { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Lỗi fetchDailyActivity:", e);
        return [];
    }
}

/**
 * Lấy dữ liệu hôm nay
 */
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

        if (error && error.code !== "PGRST116") {
            console.error("❌ Supabase error:", error);
            return { steps: 0, calories: 0, heart_rate: 0, sleep_hours: 0 };
        }

        if (data) {
            console.log("✅ Found today data:", data);
            return data;
        } else {
            console.warn("⚠️ No data found for today, returning zeros");
            return { steps: 0, calories: 0, heart_rate: 0, sleep_hours: 0 };
        }
    } catch (e) {
        console.error("❌ Lỗi getTodayActivity:", e);
        return { steps: 0, calories: 0, heart_rate: 0, sleep_hours: 0 };
    }
}

/**
 * Lấy tổng dữ liệu tuần
 */
export async function getWeeklyStats(userId: string) {
    try {
        const data = await fetchDailyActivity(userId, "week");
        const totalSteps = data.reduce((s, i) => s + (i.steps || 0), 0);
        const totalCalories = data.reduce((s, i) => s + (i.calories || 0), 0);
        const totalSleep = data.reduce((s, i) => s + (i.sleep_hours || 0), 0);
        const avgHeartRate =
            data.length > 0
                ? Math.round(
                      data.reduce((s, i) => s + (i.heart_rate || 0), 0) /
                          data.length
                  )
                : 0;

        const sleepH = Math.floor(totalSleep);
        const sleepM = Math.round((totalSleep - sleepH) * 60);

        return {
            steps: totalSteps,
            workout: 0,
            water: 0,
            sleep: `${sleepH}h ${sleepM}min`,
            avgHeartRate,
        };
    } catch (e) {
        console.error("Lỗi getWeeklyStats:", e);
        return {
            steps: 0,
            workout: 0,
            water: 0,
            sleep: "0h 0min",
            avgHeartRate: 0,
        };
    }
}

/**
 * Lấy dữ liệu theo tháng năm
 */
export async function fetchActivityByMonthYear(
    userId: string,
    month: number,
    year: number
): Promise<DailyActivity[]> {
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const formatDate = (d: Date) => d.toISOString().split("T")[0];

        const { data, error } = await supabase
            .from("daily_activity")
            .select("date, steps, calories, heart_rate, sleep_hours")
            .eq("user_id", userId)
            .gte("date", formatDate(startDate))
            .lte("date", formatDate(endDate))
            .order("date", { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Lỗi fetchActivityByMonthYear:", e);
        return [];
    }
}

/**
 * Thêm / cập nhật hoạt động ngày
 */
export async function addDailyActivity(
    userId: string,
    date: string,
    steps: number,
    calories = 0,
    heart_rate = 0,
    sleep_hours = 0
) {
    try {
        const { data, error } = await supabase
            .from("daily_activity")
            .upsert([
                {
                    user_id: userId,
                    date,
                    steps,
                    calories,
                    heart_rate,
                    sleep_hours,
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
