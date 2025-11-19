import { supabase } from "../lib/supabase";

export async function getCycleTracking(userId: string) {
    try {
        const { data, error } = await supabase
            .from("cycle_tracking")
            .select("*")
            .eq("user_id", userId)
            .order("start_date", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (e) {
        // console.error("Lỗi tải chu kỳ:", e);
        return null;
    }
}

// Tính số ngày còn lại trước kỳ
export async function getDaysBeforePeriod(userId: string): Promise<number> {
    try {
        // console.log("🔄 getDaysBeforePeriod - userId:", userId);

        const cycle = await getCycleTracking(userId);
        // console.log("🗓️ getCycleTracking result:", cycle);

        if (!cycle || !cycle.start_date) {
            // console.warn("⚠️ No cycle data found, returning default 15");
            return 15;
        }

        const startDate = new Date(cycle.start_date);
        const today = new Date();

        // Kiểm tra xem date có hợp lệ không
        if (isNaN(startDate.getTime())) {
            // console.error("❌ Invalid start_date:", cycle.start_date);
            return 15;
        }

        const daysElapsed = Math.floor(
            (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const cycleLength = cycle.average_length || 28;
        const daysBeforePeriod = cycleLength - (daysElapsed % cycleLength);

        // console.log(
        //     "✅ daysBeforePeriod calculated:",
        //     daysBeforePeriod,
        //     "from elapsed:",
        //     daysElapsed
        // );
        return Math.max(0, daysBeforePeriod);
    } catch (e) {
        // console.error("❌ Lỗi tính daysBeforePeriod:", e);
        return 15;
    }
}

export async function updateCycleTracking(
    userId: string,
    startDate: string,
    averageLength: number = 28
) {
    try {
        // Kiểm tra xem user đã có record chưa
        const { data: existing } = await supabase
            .from("cycle_tracking")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

        let result;
        if (existing) {
            // Update nếu đã tồn tại
            result = await supabase
                .from("cycle_tracking")
                .update({
                    start_date: startDate,
                    average_length: averageLength,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId)
                .select()
                .single();
        } else {
            // Insert nếu chưa tồn tại
            result = await supabase
                .from("cycle_tracking")
                .insert([
                    {
                        user_id: userId,
                        start_date: startDate,
                        average_length: averageLength,
                    },
                ])
                .select()
                .single();
        }

        if (result.error) throw result.error;
        return { error: null, data: result.data };
    } catch (e: any) {
        return { error: e.message, data: null };
    }
}
