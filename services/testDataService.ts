import { supabase } from "../lib/supabase";

/**
 * Thêm dữ liệu test vào daily_activity cho user hiện tại
 * Dùng để test và phát triển
 */
export async function insertTestData(userId: string) {
    try {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // 1. Thêm dữ liệu hôm nay
        console.log("📝 Inserting today's data...");
        const { error: activityError } = await supabase
            .from("daily_activity")
            .upsert(
                [
                    {
                        user_id: userId,
                        date: todayStr,
                        steps: 11857,
                        calories: 960,
                        heart_rate: 72,
                        sleep_hours: 7.5,
                    },
                ],
                { onConflict: "user_id,date" }
            );

        if (activityError) {
            console.error("❌ Lỗi thêm daily_activity:", activityError.message);
            return { error: activityError.message };
        }
        console.log("✅ Today's data inserted/updated successfully");

        // 2. Thêm dữ liệu tuần trước
        console.log("📝 Inserting past 6 days data...");
        const pastDaysData = [];
        for (let i = 1; i <= 6; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];

            pastDaysData.push({
                user_id: userId,
                date: dateStr,
                steps: Math.floor(Math.random() * 20000) + 5000,
                calories: Math.floor(Math.random() * 500) + 500,
                heart_rate: Math.floor(Math.random() * 30) + 60,
                sleep_hours: Math.random() * 3 + 5,
            });
        }

        const { error: weekError } = await supabase
            .from("daily_activity")
            .upsert(pastDaysData, { onConflict: "user_id,date" });

        if (weekError) {
            console.error("❌ Lỗi thêm dữ liệu tuần:", weekError.message);
            return { error: weekError.message };
        }
        console.log("✅ Past 6 days data inserted/updated successfully");

        // 3. Thêm cycle tracking
        console.log("📝 Inserting cycle tracking...");
        const cycleStartDate = new Date(today);
        cycleStartDate.setDate(today.getDate() - 10); // Bắt đầu 10 ngày trước
        const cycleStartStr = cycleStartDate.toISOString().split("T")[0];

        // Check xem user đã có cycle tracking chưa
        const { data: existing } = await supabase
            .from("cycle_tracking")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

        let cycleError;
        if (existing) {
            // Update nếu đã tồn tại
            const result = await supabase
                .from("cycle_tracking")
                .update({
                    start_date: cycleStartStr,
                    average_length: 28,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId);
            cycleError = result.error;
        } else {
            // Insert nếu chưa tồn tại
            const result = await supabase
                .from("cycle_tracking")
                .insert([
                    {
                        user_id: userId,
                        start_date: cycleStartStr,
                        average_length: 28,
                    },
                ]);
            cycleError = result.error;
        }

        if (cycleError) {
            console.error("❌ Lỗi thêm cycle_tracking:", cycleError.message);
            return { error: cycleError.message };
        }
        console.log("✅ Cycle tracking inserted/updated successfully");

        console.log("✅ Tất cả test data đã thêm/update thành công!");
        return { error: null, message: "Test data added/updated successfully" };
    } catch (e: any) {
        console.error("💥 Lỗi:", e.message);
        return { error: e.message };
    }
}
