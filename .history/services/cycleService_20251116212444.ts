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
        console.error("Lỗi tải chu kỳ:", e);
        return null;
    }
}

// Tính số ngày còn lại trước kỳ
export async function getDaysBeforePeriod(userId: string): Promise<number> {
    try {
        console.log("🔄 getDaysBeforePeriod - userId:", userId);

        const cycle = await getCycleTracking(userId);
        console.log("🗓️ getCycleTracking result:", cycle);

        if (!cycle) {
            console.log("⚠️ No cycle data found");
            return 0;
        }

        const startDate = new Date(cycle.start_date);
        const today = new Date();
        const daysElapsed = Math.floor(
            (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const daysBeforePeriod = Math.max(
            0,
            (cycle.average_length || 28) -
                (daysElapsed % (cycle.average_length || 28))
        );

        console.log("✅ daysBeforePeriod calculated:", daysBeforePeriod);
        return daysBeforePeriod;
    } catch (e) {
        console.error("❌ Lỗi tính daysBeforePeriod:", e);
        return 0;
    }
}

export async function updateCycleTracking(
    userId: string,
    startDate: string,
    averageLength: number = 28
) {
    try {
        const { data, error } = await supabase
            .from("cycle_tracking")
            .upsert([
                {
                    user_id: userId,
                    start_date: startDate,
                    average_length: averageLength,
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
