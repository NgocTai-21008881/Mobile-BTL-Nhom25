// DoubleSupportScreen.tsx (rút gọn phần loadData)
import { fetchDailyActivity, RangeKey } from "../services/activityService";

const loadData = async (range: RangeKey) => {
    try {
        setLoading(true);
        const data = await fetchDailyActivity(range);

        if (!data || data.length === 0) {
            setGraphData([]);
            setLabels([]);
            return;
        }

        setGraphData(data.map((d: any) => d.steps));
        setLabels(
            data.map((d: any) => {
                const day = new Date(d.date);
                if (range === "week") return `T${((day.getDay() + 6) % 7) + 1}`;
                if (range === "month") return `${day.getDate()}`;
                return `${day.getDate()}/${day.getMonth() + 1}`;
            })
        );
    } catch (e) {
        console.error("Lỗi tải dữ liệu:", e);
    } finally {
        setLoading(false);
    }
};
