import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";

export default function DoubleSupportScreen() {
    // Weekly data (Mon → Sun)
    const graphData = [5000, 6000, 8000, 7000, 8500, 9500, 10500];

    const maxVal = useMemo(() => Math.max(...graphData, 10000), [graphData]);
    const total = useMemo(
        () => graphData.reduce((a, b) => a + b, 0),
        [graphData]
    );
    const avg = useMemo(
        () => Math.round(total / graphData.length),
        [total, graphData]
    );

    const goal = 10000;
    const progress = Math.min(1, avg / goal);

    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

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
                {/* Stats Row */}
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

                {/* Chart Card */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Hoạt động tuần</Text>
                        <View style={styles.segment}>
                            <TouchableOpacity
                                style={[
                                    styles.segmentBtn,
                                    styles.segmentBtnActive,
                                ]}
                            >
                                <Text style={styles.segmentTextActive}>
                                    Tuần
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.segmentBtn}>
                                <Text style={styles.segmentText}>Tháng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.segmentBtn}>
                                <Text style={styles.segmentText}>Quý</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Simple Bar Chart (no lib) */}
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

                    <View style={styles.chartFooter}>
                        <Text style={styles.chartFootText}>
                            Cao nhất:{" "}
                            {Math.max(...graphData).toLocaleString("vi-VN")}{" "}
                            bước
                        </Text>
                        <Text style={styles.chartFootText}>
                            Thấp nhất:{" "}
                            {Math.min(...graphData).toLocaleString("vi-VN")}{" "}
                            bước
                        </Text>
                    </View>
                </View>

                {/* Goals & Tips */}
                <View style={styles.row}>
                    <View style={styles.goalCard}>
                        <Text style={styles.goalTitle}>Mục tiêu hôm nay</Text>
                        <Text style={styles.goalBig}>
                            {goal.toLocaleString("vi-VN")} bước
                        </Text>
                        <View style={styles.pillRow}>
                            <View style={styles.pill}>
                                <Text style={styles.pillText}>
                                    🚶 Đi bộ 20'
                                </Text>
                            </View>
                            <View style={styles.pill}>
                                <Text style={styles.pillText}>
                                    🧘 Thả lỏng 5'
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.goalBtn}
                        >
                            <Text style={styles.goalBtnText}>Bắt đầu ngay</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tipCard}>
                        <Text style={styles.tipTitle}>Gợi ý nhanh</Text>
                        <View style={styles.tipItem}>
                            <Text style={styles.tipDot}>•</Text>
                            <Text style={styles.tipText}>
                                Uống nước đều mỗi 2 giờ.
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Text style={styles.tipDot}>•</Text>
                            <Text style={styles.tipText}>
                                Ưu tiên đi thang bộ nếu có thể.
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Text style={styles.tipDot}>•</Text>
                            <Text style={styles.tipText}>
                                Giãn cơ 3 phút sau khi vận động.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Action Shortcuts */}
                <View style={styles.shortcuts}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#E9F8FB" },
                        ]}
                    >
                        <Text style={styles.shortcutEmoji}>📝</Text>
                        <Text style={styles.shortcutTitle}>Nhật ký</Text>
                        <Text style={styles.shortcutDesc}>
                            Ghi nhanh hoạt động
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#F6F0FF" },
                        ]}
                    >
                        <Text style={styles.shortcutEmoji}>🎯</Text>
                        <Text style={styles.shortcutTitle}>Mục tiêu</Text>
                        <Text style={styles.shortcutDesc}>
                            Chỉnh lại mục tiêu
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#FFF5EC" },
                        ]}
                    >
                        <Text style={styles.shortcutEmoji}>📈</Text>
                        <Text style={styles.shortcutTitle}>Báo cáo</Text>
                        <Text style={styles.shortcutDesc}>
                            Xem chi tiết tháng
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 20,
    },
    header: {
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
    headerSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
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
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    cardPrimary: {
        borderWidth: 1,
        borderColor: "#D1FAE5",
        backgroundColor: "#ECFDF5",
    },
    cardLabel: {
        color: "#0F766E",
        fontWeight: "700",
        fontSize: 12,
        letterSpacing: 0.3,
    },
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
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
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
        gap: 10,
        height: 140,
        marginTop: 16,
        paddingHorizontal: 6,
    },
    barWrap: { alignItems: "center", justifyContent: "flex-end", flex: 1 },
    bar: {
        width: "70%",
        backgroundColor: "#38BDF8",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    barLabel: {
        marginTop: 6,
        fontSize: 12,
        color: "#64748B",
        fontWeight: "700",
    },
    chartFooter: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    chartFootText: { color: "#475569", fontSize: 12 },

    goalCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    goalTitle: { color: "#0F172A", fontWeight: "800", fontSize: 14 },
    goalBig: {
        color: "#1F2937",
        fontWeight: "800",
        fontSize: 22,
        marginTop: 8,
    },
    pillRow: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
    pill: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    pillText: { color: "#0F172A", fontWeight: "600", fontSize: 12 },
    goalBtn: {
        marginTop: 14,
        backgroundColor: "#0EA5E9",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    goalBtnText: { color: "#fff", fontWeight: "800" },

    tipCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    tipTitle: {
        color: "#0F172A",
        fontWeight: "800",
        fontSize: 14,
        marginBottom: 8,
    },
    tipItem: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    tipDot: { color: "#34D399", fontSize: 18, marginRight: 6, lineHeight: 18 },
    tipText: { color: "#334155", fontSize: 13 },

    shortcuts: { flexDirection: "row", gap: 12, marginTop: 18 },
    shortcut: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    shortcutEmoji: { fontSize: 20, marginBottom: 8 },
    shortcutTitle: { fontWeight: "800", color: "#0F172A" },
    shortcutDesc: { color: "#64748B", fontSize: 12, marginTop: 2 },
});
