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
        const { error: activityError } = await supabase
            .from("daily_activity")
            .upsert([
                {
                    user_id: userId,
                    date: todayStr,
                    steps: 11857,
                    calories: 960,
                    heart_rate: 72,
                    sleep_hours: 7.5,
                },
            ]);

        if (activityError) {
            console.error("❌ Lỗi thêm daily_activity:", activityError.message);
            return { error: activityError.message };
        }

        // 2. Thêm dữ liệu tuần trước
        for (let i = 1; i <= 6; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];

            const { error: weekError } = await supabase
                .from("daily_activity")
                .upsert([
                    {
                        user_id: userId,
                        date: dateStr,
                        steps: Math.floor(Math.random() * 20000) + 5000,
                        calories: Math.floor(Math.random() * 500) + 500,
                        heart_rate: Math.floor(Math.random() * 30) + 60,
                        sleep_hours: Math.random() * 3 + 5,
                    },
                ]);

            if (weekError) {
                console.error(
                    `❌ Lỗi thêm dữ liệu ngày ${dateStr}:`,
                    weekError.message
                );
            }
        }

        // 3. Thêm cycle tracking
        const cycleStartDate = new Date(today);
        cycleStartDate.setDate(today.getDate() - 10); // Bắt đầu 10 ngày trước
        const cycleStartStr = cycleStartDate.toISOString().split("T")[0];

        const { error: cycleError } = await supabase
            .from("cycle_tracking")
            .upsert([
                {
                    user_id: userId,
                    start_date: cycleStartStr,
                    average_length: 28,
                },
            ]);

        if (cycleError) {
            console.error("❌ Lỗi thêm cycle_tracking:", cycleError.message);
            return { error: cycleError.message };
        }

        console.log("✅ Thêm test data thành công!");
        return { error: null, message: "Test data added successfully" };
    } catch (e: any) {
        console.error("💥 Lỗi:", e.message);
        return { error: e.message };
    }
}
