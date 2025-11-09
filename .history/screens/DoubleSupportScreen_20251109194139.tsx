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
    const [loading, setLoading] = useState(true);
    const [goal, setGoal] = useState(10000); // bạn có thể load từ bảng user_goals sau

    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                // Lấy user hiện tại
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) throw new Error("User chưa đăng nhập");

                // Lấy dữ liệu hoạt động 7 ngày gần nhất
                const { data, error } = await supabase
                    .from("daily_activity")
                    .select("date, steps")
                    .eq("user_id", user.id)
                    .order("date", { ascending: true })
                    .limit(7);

                if (error) throw error;
                if (!data || data.length === 0) {
                    setGraphData([]);
                } else {
                    setGraphData(data.map((d) => d.steps));
                }
            } catch (e) {
                console.error("Lỗi khi tải dữ liệu từ Supabase:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Nếu đang load
    if (loading) {
        return (
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
        );
    }

    // Nếu chưa có dữ liệu
    if (graphData.length === 0) {
        return (
            <View style={styles.container}>
                <Text
                    style={{
                        color: "#334155",
                        textAlign: "center",
                        marginTop: 40,
                    }}
                >
                    Chưa có dữ liệu hoạt động. Hãy ghi nhận số bước hôm nay!
                </Text>
            </View>
        );
    }

    // Tính toán dữ liệu
    const maxVal = useMemo(() => Math.max(...graphData, 10000), [graphData]);
    const total = useMemo(
        () => graphData.reduce((a, b) => a + b, 0),
        [graphData]
    );
    const avg = useMemo(
        () => Math.round(total / graphData.length),
        [total, graphData]
    );
    const progress = Math.min(1, avg / goal);

    return (
        <View style={styles.container}>
            {/* Header */}
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 28 }}
            >
                {/* Stats */}
                <View style={styles.row}>
                    <View style={[styles.card, styles.cardPrimary]}>
                        <Text style={styles.cardLabel}>Bước trung bình</Text>
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
                            Mục tiêu: {goal.toLocaleString("vi-VN")} bước/ngày
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Tổng tuần này</Text>
                        <Text style={styles.cardValue}>
                            {total.toLocaleString("vi-VN")}
                        </Text>
                        <Text style={styles.cardHint}>T2–CN</Text>
                    </View>
                </View>

                {/* Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Hoạt động tuần</Text>
                    <View style={styles.chartArea}>
                        {graphData.map((v, i) => {
                            const h = Math.max(8, (v / maxVal) * 120);
                            return (
                                <View key={i} style={styles.barWrap}>
                                    <View style={[styles.bar, { height: h }]} />
                                    <Text style={styles.barLabel}>
                                        {days[i]}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
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
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 10,
    },
    chartArea: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        height: 140,
    },
    barWrap: { alignItems: "center", flex: 1 },
    bar: { width: 18, backgroundColor: "#38BDF8", borderRadius: 6 },
    barLabel: {
        marginTop: 6,
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
    },
});
