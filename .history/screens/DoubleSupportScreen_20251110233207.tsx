import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";

// ⚠️ Không load dữ liệu từ server. Dùng dữ liệu mô phỏng tại chỗ.
export default function DoubleSupportScreen() {
    const [selectedRange, setSelectedRange] = useState("week"); // "week" | "month" | "quarter"
    const [goal, setGoal] = useState(10000);

    // --- Data mock -----------------------------------------------------------
    const { graphData, labels } = useMemo(
        () => buildMock(selectedRange),
        [selectedRange]
    );

    // --- Stats ---------------------------------------------------------------
    const maxVal = useMemo(() => Math.max(10000, ...graphData), [graphData]);
    const total = useMemo(
        () => graphData.reduce((a, b) => a + b, 0),
        [graphData]
    );
    const avg = useMemo(
        () => Math.round(total / (graphData.length || 1)),
        [total, graphData]
    );
    const progress = Math.min(1, avg / goal);
    const bestIdx = useMemo(
        () =>
            graphData.length ? graphData.indexOf(Math.max(...graphData)) : 0,
        [graphData]
    );
    const worstIdx = useMemo(
        () =>
            graphData.length ? graphData.indexOf(Math.min(...graphData)) : 0,
        [graphData]
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Sức khỏe của tôi</Text>
                    <Text style={styles.subtitle}>Tổng quan hoạt động</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.primaryBtn}
                >
                    <Text style={styles.primaryBtnText}>+ Ghi nhận</Text>
                </TouchableOpacity>
            </View>

            {/* Range Switcher */}
            <View style={styles.segmentWrap}>
                {[
                    { k: "week", t: "Tuần" },
                    { k: "month", t: "Tháng" },
                    { k: "quarter", t: "Quý" },
                ].map(({ k, t }) => (
                    <TouchableOpacity
                        key={k}
                        onPress={() => setSelectedRange(k)}
                        activeOpacity={0.9}
                        style={[
                            styles.segmentBtn,
                            selectedRange === k && styles.segmentBtnActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                selectedRange === k && styles.segmentTextActive,
                            ]}
                        >
                            {t}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Highlight Card */}
                <View style={styles.highlightCard}>
                    <View style={styles.highlightRow}>
                        <View style={styles.highlightColLeft}>
                            <Text style={styles.kpiLabel}>Bước trung bình</Text>
                            <Text style={styles.kpiValue}>
                                {avg.toLocaleString("vi-VN")}
                            </Text>
                            <View style={styles.progressTrack}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${progress * 100}%` },
                                    ]}
                                />
                            </View>
                            <Text style={styles.kpiHint}>
                                Mục tiêu: {goal.toLocaleString("vi-VN")}{" "}
                                bước/ngày
                            </Text>
                            <View style={styles.goalRow}>
                                <TouchableOpacity
                                    style={styles.goalBtn}
                                    onPress={() =>
                                        setGoal(Math.max(1000, goal - 500))
                                    }
                                >
                                    <Text style={styles.goalBtnText}>-500</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.goalBtn}
                                    onPress={() => setGoal(goal + 500)}
                                >
                                    <Text style={styles.goalBtnText}>+500</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.highlightDivider} />
                        <View style={styles.highlightColRight}>
                            <View style={styles.miniStat}>
                                <Text style={styles.miniStatLabel}>Tổng</Text>
                                <Text style={styles.miniStatValue}>
                                    {total.toLocaleString("vi-VN")}
                                </Text>
                                <Text style={styles.miniStatHint}>
                                    {rangeLabel(selectedRange)}
                                </Text>
                            </View>
                            <View style={[styles.miniStat, { marginTop: 12 }]}>
                                <Text style={styles.miniStatLabel}>
                                    Ngày tốt nhất
                                </Text>
                                <Text style={styles.miniStatValue}>
                                    {graphData[bestIdx]?.toLocaleString(
                                        "vi-VN"
                                    ) || 0}
                                </Text>
                                <Text style={styles.miniStatHint}>
                                    {labels[bestIdx] || "—"}
                                </Text>
                            </View>
                            <View style={[styles.miniStat, { marginTop: 12 }]}>
                                <Text style={styles.miniStatLabel}>
                                    Ngày thấp nhất
                                </Text>
                                <Text style={styles.miniStatValue}>
                                    {graphData[worstIdx]?.toLocaleString(
                                        "vi-VN"
                                    ) || 0}
                                </Text>
                                <Text style={styles.miniStatHint}>
                                    {labels[worstIdx] || "—"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Chart Card */}
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
                        <Text style={styles.chartLegend}>
                            Cột = số bước/ngày
                        </Text>
                    </View>

                    {/* Simple grid */}
                    <View style={styles.grid}>
                        {[1, 0.75, 0.5, 0.25].map((r) => (
                            <View key={r} style={styles.gridLine}>
                                <Text style={styles.gridLabel}>
                                    {Math.round(maxVal * r).toLocaleString(
                                        "vi-VN"
                                    )}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Bars */}
                    <View style={styles.chartArea}>
                        {graphData.map((v, i) => {
                            const h = Math.max(8, (v / maxVal) * 120);
                            const isBest = i === bestIdx;
                            return (
                                <View key={i} style={styles.barWrap}>
                                    <View
                                        style={[
                                            styles.bar,
                                            isBest && styles.barBest,
                                            { height: h },
                                        ]}
                                    />
                                    <Text style={styles.barLabel}>
                                        {labels[i]}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Tips Card */}
                <View style={styles.tipCard}>
                    <Text style={styles.tipTitle}>Gợi ý nhanh</Text>
                    <View style={styles.tipList}>
                        <Text style={styles.tipItem}>
                            • Đi bộ 5–10 phút sau mỗi giờ làm việc.
                        </Text>
                        <Text style={styles.tipItem}>
                            • Ưu tiên đi thang bộ thay vì thang máy.
                        </Text>
                        <Text style={styles.tipItem}>
                            • Đặt mục tiêu từng bước nhỏ (+500 bước) mỗi tuần.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// Helpers -------------------------------------------------------------------
function rangeLabel(r) {
    if (r === "week") return "7 ngày";
    if (r === "month") return "30 ngày";
    return "90 ngày";
}

function buildMock(range) {
    const len = range === "week" ? 7 : range === "month" ? 30 : 30; // Hiển thị 30 cột cho quý (tổng hợp theo ngày đại diện)
    // Tạo nhịp tăng giảm nhẹ
    const base = 8000;
    const wave = Array.from({ length: len }, (_, i) => {
        const oscillate = Math.sin(i / 2.8) * 1800; // dao động
        const noise = (Math.random() - 0.5) * 1200; // nhiễu
        const val = Math.max(800, Math.round(base + oscillate + noise));
        return val;
    });

    const labels = Array.from({ length: len }, (_, i) => {
        if (range === "week")
            return `T${((i + 0) % 7) + 2 > 8 ? 1 : ((i + 0) % 7) + 2}`.replace(
                "8",
                "CN"
            ); // T2..T7, CN
        if (range === "month") return `${i + 1}`;
        return `${i + 1}`; // 30 cột đại diện trong quý
    });

    return { graphData: wave, labels };
}

// Styles --------------------------------------------------------------------
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F6F7FB", padding: 18 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
    subtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
    primaryBtn: {
        backgroundColor: "#10B981",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    primaryBtnText: { color: "#fff", fontWeight: "700" },

    segmentWrap: {
        flexDirection: "row",
        backgroundColor: "#E9EEF5",
        borderRadius: 12,
        padding: 4,
        gap: 6,
        marginTop: 16,
    },
    segmentBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    segmentBtnActive: { backgroundColor: "#fff" },
    segmentText: { color: "#55627A", fontWeight: "600", fontSize: 12 },
    segmentTextActive: { color: "#0F172A", fontWeight: "800", fontSize: 12 },

    highlightCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginTop: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E8F7F0",
    },
    highlightRow: { flexDirection: "row" },
    highlightColLeft: { flex: 1, paddingRight: 12 },
    highlightDivider: { width: 1, backgroundColor: "#EEF2F7" },
    highlightColRight: { flex: 1, paddingLeft: 12 },

    kpiLabel: { color: "#0F766E", fontWeight: "700", fontSize: 12 },
    kpiValue: {
        fontSize: 30,
        fontWeight: "800",
        color: "#065F46",
        marginTop: 6,
    },
    kpiHint: { color: "#6B7280", fontSize: 12, marginTop: 8 },
    progressTrack: {
        height: 10,
        backgroundColor: "#D1FAE5",
        borderRadius: 999,
        marginTop: 12,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#10B981",
        borderRadius: 999,
    },

    goalRow: { flexDirection: "row", gap: 10, marginTop: 12 },
    goalBtn: {
        backgroundColor: "#0EA5E9",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    goalBtnText: { color: "#fff", fontWeight: "800" },

    miniStat: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#EEF2F7",
    },
    miniStatLabel: { color: "#334155", fontWeight: "700", fontSize: 12 },
    miniStatValue: {
        color: "#0F172A",
        fontWeight: "800",
        fontSize: 20,
        marginTop: 2,
    },
    miniStatHint: { color: "#64748B", fontSize: 12, marginTop: 2 },

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
    chartLegend: { fontSize: 12, color: "#64748B" },

    grid: { marginTop: 10 },
    gridLine: {
        height: 32,
        borderTopWidth: 1,
        borderTopColor: "#EDF2F7",
        justifyContent: "center",
    },
    gridLabel: {
        position: "absolute",
        right: 0,
        top: -8,
        fontSize: 10,
        color: "#94A3B8",
    },

    chartArea: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        height: 140,
        marginTop: 6,
    },
    barWrap: { alignItems: "center", flex: 1 },
    bar: { width: 16, borderRadius: 8, backgroundColor: "#38BDF8" },
    barBest: { backgroundColor: "#22C55E" },
    barLabel: { marginTop: 6, fontSize: 11, color: "#475569" },

    tipCard: {
        marginTop: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#EEF2F7",
    },
    tipTitle: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
    tipList: { marginTop: 8 },
    tipItem: { color: "#334155", fontSize: 13, marginTop: 4 },
});
