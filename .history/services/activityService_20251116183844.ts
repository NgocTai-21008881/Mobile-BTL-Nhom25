import { supabase } from "../lib/supabase";

export type RangeKey = "week" | "month" | "quarter";

export async function fetchDailyActivity(userId: string, range: RangeKey) {
    try {
        const today = new Date();
        const startDate = new Date();

        if (range === "week") startDate.setDate(today.getDate() - 6);
        else if (range === "month") startDate.setDate(today.getDate() - 29);
        else startDate.setDate(today.getDate() - 89);

        const { data, error } = await supabase
            .from("daily_activity")
            .select("date, steps, calories, heart_rate, sleep_hours")
            .eq("user_id", userId)
            .gte("date", startDate.toISOString().split("T")[0])
            .lte("date", today.toISOString().split("T")[0])
            .order("date", { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Lỗi tải dữ liệu hoạt động:", e);
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
