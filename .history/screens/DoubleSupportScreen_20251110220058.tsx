import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function DoubleSupportScreen() {
    const [graphData, setGraphData] = useState<number[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState<
        "week" | "month" | "quarter"
    >("week");
    const [goal, setGoal] = useState(10000);

    useEffect(() => {
        loadData(selectedRange);
    }, [selectedRange]);

    const loadData = async (range: "week" | "month" | "quarter") => {
        try {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("User chưa đăng nhập");

            const today = new Date();
            const startDate = new Date();

            if (range === "week") startDate.setDate(today.getDate() - 6);
            if (range === "month") startDate.setDate(today.getDate() - 29);
            if (range === "quarter") startDate.setDate(today.getDate() - 89);

            // Truy vấn dữ liệu theo khoảng thời gian
            const { data, error } = await supabase
                .from("daily_activity")
                .select("date, steps")
                .eq("user_id", user.id)
                .gte("date", startDate.toISOString().split("T")[0])
                .lte("date", today.toISOString().split("T")[0])
                .order("date", { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                setGraphData([]);
                setLabels([]);
                return;
            }

            setGraphData(data.map((d) => d.steps));
            setLabels(
                data.map((d) => {
                    const day = new Date(d.date);
                    if (range === "week")
                        return `T${((day.getDay() + 6) % 7) + 1}`;
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

    // Thống kê
    const maxVal = useMemo(() => Math.max(...graphData, 10000), [graphData]);
    const total = useMemo(
        () => graphData.reduce((a, b) => a + b, 0),
        [graphData]
    );
    const avg = useMemo(
        () => Math.round(total / (graphData.length || 1)),
        [total, graphData]
    );
    const progress = Math.min(1, avg / goal);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Sức khỏe của tôi</Text>
                    <Text style={styles.headerSubtitle}>
                        Bảng điều khiển tổng quan
                    </Text>
                </View>
                <TouchableOpacity activeOpacity={0.8} style={styles.headerBtn}>
                    <Text style={styles.headerBtnText}>+ Ghi nhận</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ color: "#64748B", marginTop: 10 }}>
                        Đang tải dữ liệu...
                    </Text>
                </View>
            ) : graphData.length === 0 ? (
                <Text
                    style={{
                        textAlign: "center",
                        color: "#475569",
                        marginTop: 40,
                    }}
                >
                    Không có dữ liệu trong khoảng thời gian này
                </Text>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Stats */}
                    <View style={styles.row}>
                        <View style={[styles.card, styles.cardPrimary]}>
                            <Text style={styles.cardLabel}>
                                Bước trung bình
                            </Text>
                            <Text style={styles.cardValue}>
                                {avg.toLocaleString("vi-VN")}
                            </Text>
                            <View style={styles.progressWrap}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        { width: `${progress * 100}%` },
                                    ]}
                                />
                            </View>
                            <Text style={styles.cardHint}>
                                Mục tiêu: {goal.toLocaleString("vi-VN")}{" "}
                                bước/ngày
                            </Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>Tổng</Text>
                            <Text style={styles.cardValue}>
                                {total.toLocaleString("vi-VN")}
                            </Text>
                            <Text style={styles.cardHint}>
                                {selectedRange === "week"
                                    ? "7 ngày"
                                    : selectedRange === "month"
                                    ? "30 ngày"
                                    : "90 ngày"}
                            </Text>
                        </View>
                    </View>

                    {/* Chart */}
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.chartTitle}>
                                Hoạt động{" "}
                                {selectedRange === "week"
                                    ? "tuần"
                                    : selectedRange === "month"
                                    ? "tháng"
                                    : "quý"}
                            </Text>
                            <View style={styles.segment}>
                                {["week", "month", "quarter"].map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        onPress={() =>
                                            setSelectedRange(r as any)
                                        }
                                        style={[
                                            styles.segmentBtn,
                                            selectedRange === r &&
                                                styles.segmentBtnActive,
                                        ]}
                                    >
                                        <Text
                                            style={
                                                selectedRange === r
                                                    ? styles.segmentTextActive
                                                    : styles.segmentText
                                            }
                                        >
                                            {r === "week"
                                                ? "Tuần"
                                                : r === "month"
                                                ? "Tháng"
                                                : "Quý"}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.chartArea}>
                            {graphData.map((v, i) => {
                                const h = Math.max(8, (v / maxVal) * 120);
                                return (
                                    <View key={i} style={styles.barWrap}>
                                        <View
                                            style={[styles.bar, { height: h }]}
                                        />
                                        <Text style={styles.barLabel}>
                                            {labels[i]}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

// Styles giữ nguyên như bạn đang có
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
    headerSubtitle: { fontSize: 13, color: "#64748B" },
    headerBtn: {
        backgroundColor: "#10B981",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    headerBtnText: { color: "#fff", fontWeight: "700" },
    row: { flexDirection: "row", gap: 14, marginTop: 16 },
    card: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardPrimary: {
        borderWidth: 1,
        borderColor: "#D1FAE5",
        backgroundColor: "#ECFDF5",
    },
    cardLabel: { color: "#0F766E", fontWeight: "700", fontSize: 12 },
    cardValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "#065F46",
        marginTop: 6,
    },
    cardHint: { color: "#6B7280", fontSize: 12, marginTop: 8 },
    progressWrap: {
        height: 10,
        backgroundColor: "#D1FAE5",
        borderRadius: 999,
        marginTop: 12,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#10B981",
        borderRadius: 999,
    },
    chartCard: {
        marginTop: 16,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
    },
    chartHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    chartTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
    segment: {
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        flexDirection: "row",
        padding: 4,
    },
    segmentBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    segmentBtnActive: { backgroundColor: "#fff" },
    segmentText: { color: "#64748B", fontWeight: "600", fontSize: 12 },
    segmentTextActive: { color: "#0F172A", fontWeight: "800", fontSize: 12 },
    chartArea: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        height: 140,
        marginTop: 16,
    },
    barWrap: { alignItems: "center", flex: 1 },
    bar: { width: 16, borderRadius: 8, backgroundColor: "#38BDF8" },
    barLabel: { marginTop: 6, fontSize: 12, color: "#475569" },
});
