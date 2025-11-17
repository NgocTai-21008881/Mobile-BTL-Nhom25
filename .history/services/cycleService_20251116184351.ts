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
