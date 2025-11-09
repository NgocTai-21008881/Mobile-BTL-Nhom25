import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";

export default function CaloriesScreen() {
    // Data (calories burned each day in a week)
    const graphData = [320, 450, 380, 500, 600, 720, 400];
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const maxVal = useMemo(() => Math.max(...graphData), [graphData]);
    const total = useMemo(
        () => graphData.reduce((a, b) => a + b, 0),
        [graphData]
    );
    const avg = useMemo(
        () => Math.round(total / graphData.length),
        [total, graphData]
    );
    const goal = 500;
    const progress = Math.min(1, avg / goal);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Calories Burned</Text>
                <Text style={styles.headerSubtitle}>
                    Theo dõi năng lượng tiêu hao
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* Summary cards */}
                <View style={styles.row}>
                    <View style={[styles.card, styles.cardMain]}>
                        <Text style={styles.cardLabel}>Trung bình</Text>
                        <Text style={styles.cardValue}>{avg} kcal</Text>
                        <View style={styles.progressWrap}>
                            <View
                                style={[
                                    styles.progressBar,
                                    { width: `${progress * 100}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.cardHint}>
                            Mục tiêu: {goal} kcal/ngày
                        </Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Tổng tuần này</Text>
                        <Text style={styles.cardValue}>{total} kcal</Text>
                        <Text style={styles.cardHint}>T2–CN</Text>
                    </View>
                </View>

                {/* Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>
                        Biểu đồ năng lượng đốt cháy
                    </Text>
                    <View style={styles.chartArea}>
                        {graphData.map((v, i) => {
                            const height = (v / maxVal) * 120;
                            const color = v >= goal ? "#F97316" : "#FDBA74";
                            return (
                                <View key={i} style={styles.barWrap}>
                                    <View
                                        style={[
                                            styles.bar,
                                            { height, backgroundColor: color },
                                        ]}
                                    />
                                    <Text style={styles.barLabel}>
                                        {days[i]}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#FDBA74" },
                                ]}
                            />
                            <Text style={styles.legendText}>Dưới mục tiêu</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#F97316" },
                                ]}
                            />
                            <Text style={styles.legendText}>
                                Đạt / Vượt mục tiêu
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Activity Suggestions */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>
                        Gợi ý tăng cường đốt calo
                    </Text>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>🔥</Text>
                        <Text style={styles.tipText}>
                            Tập cardio 20 phút mỗi ngày.
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>🚴</Text>
                        <Text style={styles.tipText}>
                            Đi xe đạp hoặc chạy bộ nhẹ vào buổi sáng.
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>💧</Text>
                        <Text style={styles.tipText}>
                            Uống nước đủ để duy trì trao đổi chất tốt.
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.shortcuts}>
                    <TouchableOpacity
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#FFF7ED" },
                        ]}
                    >
                        <Text style={styles.shortcutEmoji}>🔥</Text>
                        <Text style={styles.shortcutTitle}>Theo dõi tập</Text>
                        <Text style={styles.shortcutDesc}>
                            Xem bài tập hôm nay
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#ECFDF5" },
                        ]}
                    >
                        <Text style={styles.shortcutEmoji}>📈</Text>
                        <Text style={styles.shortcutTitle}>Báo cáo tuần</Text>
                        <Text style={styles.shortcutDesc}>
                            Xem tiến trình đốt calo
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#F0F9FF" },
                        ]}
                    >
                        <Text style={styles.shortcutEmoji}>🎯</Text>
                        <Text style={styles.shortcutTitle}>
                            Cập nhật mục tiêu
                        </Text>
                        <Text style={styles.shortcutDesc}>
                            Chỉnh lại mục tiêu hằng ngày
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
    header: { marginBottom: 16 },
    headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
    headerSubtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
    row: { flexDirection: "row", gap: 14, marginBottom: 20 },

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
    cardMain: {
        backgroundColor: "#FFF7ED",
        borderWidth: 1,
        borderColor: "#FED7AA",
    },
    cardLabel: { color: "#C2410C", fontWeight: "700", fontSize: 12 },
    cardValue: {
        fontSize: 26,
        fontWeight: "800",
        color: "#9A3412",
        marginTop: 4,
    },
    cardHint: { color: "#6B7280", fontSize: 12, marginTop: 6 },
    progressWrap: {
        height: 8,
        backgroundColor: "#FED7AA",
        borderRadius: 999,
        marginTop: 10,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#F97316",
        borderRadius: 999,
    },

    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20,
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
    bar: { width: 18, borderRadius: 8 },
    barLabel: {
        marginTop: 6,
        fontSize: 12,
        color: "#475569",
        fontWeight: "600",
    },
    chartLegend: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    legendItem: { flexDirection: "row", alignItems: "center" },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 12, color: "#475569" },

    tipsCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 10,
    },
    tipItem: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    tipDot: { fontSize: 16, marginRight: 6 },
    tipText: { color: "#334155", fontSize: 13, flex: 1 },

    shortcuts: { flexDirection: "row", gap: 12 },
    shortcut: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 12,
        alignItems: "center",
    },
    shortcutEmoji: { fontSize: 22, marginBottom: 8 },
    shortcutTitle: { fontWeight: "800", color: "#0F172A" },
    shortcutDesc: { color: "#64748B", fontSize: 12, marginTop: 2 },
});
