import { supabase } from "../lib/supabase";

export interface SleepSchedule {
    bedtime: string;
    wakeup_time: string;
}

// ========================================
// Lấy lịch trình ngủ của user
// ========================================
export async function getSleepSchedule(userId: string) {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("sleep_bedtime, sleep_wakeup_time")
            .eq("id", userId)
            .single();

        if (error) {
            // console.error("❌ Lỗi lấy lịch ngủ:", error.message);
            return { bedtime: "22:00", wakeup_time: "07:00" };
        }

        return {
            bedtime: data?.sleep_bedtime || "22:00",
            wakeup_time: data?.sleep_wakeup_time || "07:00",
        };
    } catch (e: any) {
        // console.error("❌ Lỗi:", e.message);
        return { bedtime: "22:00", wakeup_time: "07:00" };
    }
}

// ========================================
// Cập nhật lịch trình ngủ
// ========================================
export async function updateSleepSchedule(
    userId: string,
    bedtime: string,
    wakeup_time: string
) {
    try {
        const { data, error } = await supabase
            .from("users")
            .update({
                sleep_bedtime: bedtime,
                sleep_wakeup_time: wakeup_time,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            // console.error("❌ Lỗi cập nhật lịch ngủ:", error.message);
            return { error: error.message, success: false };
        }

        return { error: null, success: true };
    } catch (e: any) {
        return { error: e.message ?? "Lỗi máy chủ", success: false };
    }
}

// ========================================
// Tính độ sâu giấc ngủ
// ========================================
export function calculateDeepSleep(avgSleepHours: number) {
    const deepSleepPercent = Math.min(85, Math.round((avgSleepHours / 9) * 85));
    const avgDeepTime = Math.round((avgSleepHours * 0.6 * 60) / 60) * 60;
    const hours = Math.floor(avgDeepTime / 60);
    const mins = avgDeepTime % 60;
    return {
        percent: deepSleepPercent,
        time: `${hours}h ${mins}min`,
    };
}

// ========================================
// Đánh giá chất lượng giấc ngủ
// ========================================
export function evaluateSleepQuality(avgSleepHours: number): string {
    if (avgSleepHours < 5) return "Poor";
    if (avgSleepHours < 7) return "Fair";
    if (avgSleepHours < 9) return "Good";
    return "Excellent";
}

// ========================================
// Tính giờ ngủ dự kiến từ lịch trình
// ========================================
export function calculateScheduledSleep(bedtime: string, wakeup_time: string) {
    const timeToMinutes = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const bedtimeMin = timeToMinutes(bedtime);
    const wakeMin = timeToMinutes(wakeup_time);
    let diffMin = wakeMin - bedtimeMin;
    if (diffMin < 0) diffMin += 24 * 60;
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return { hours, minutes: mins, display: `${hours}h ${mins}min` };
}
