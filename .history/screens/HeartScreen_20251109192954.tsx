import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";

export default function HeartScreen() {
    const heartRates = [72, 80, 76, 90, 85, 88, 70];
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const maxRate = useMemo(() => Math.max(...heartRates), [heartRates]);
    const minRate = useMemo(() => Math.min(...heartRates), [heartRates]);
    const avgRate = useMemo(
        () =>
            Math.round(
                heartRates.reduce((a, b) => a + b, 0) / heartRates.length
            ),
        [heartRates]
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Nhịp tim</Text>
                <Text style={styles.headerSubtitle}>
                    Theo dõi sức khỏe tim mạch
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Summary Cards */}
                <View style={styles.row}>
                    <View style={[styles.card, styles.cardMain]}>
                        <Text style={styles.cardLabel}>Trung bình</Text>
                        <Text style={styles.cardValue}>{avgRate} bpm</Text>
                        <Text style={styles.cardHint}>Mức bình thường</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Cao nhất</Text>
                        <Text style={styles.cardValue}>{maxRate} bpm</Text>
                        <Text style={styles.cardHint}>Lúc hoạt động mạnh</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Thấp nhất</Text>
                        <Text style={styles.cardValue}>{minRate} bpm</Text>
                        <Text style={styles.cardHint}>Lúc nghỉ ngơi</Text>
                    </View>
                </View>

                {/* Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>
                        Biểu đồ nhịp tim tuần này
                    </Text>
                    <View style={styles.chartArea}>
                        {heartRates.map((rate, i) => {
                            const height = (rate / 100) * 120;
                            const color =
                                rate > 85
                                    ? "#EF4444"
                                    : rate < 75
                                    ? "#60A5FA"
                                    : "#10B981";
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
                                    { backgroundColor: "#60A5FA" },
                                ]}
                            />
                            <Text style={styles.legendText}>Thấp</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#10B981" },
                                ]}
                            />
                            <Text style={styles.legendText}>Bình thường</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#EF4444" },
                                ]}
                            />
                            <Text style={styles.legendText}>Cao</Text>
                        </View>
                    </View>
                </View>

                {/* Health Tips */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>
                        Lời khuyên cho tim khỏe mạnh
                    </Text>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>•</Text>
                        <Text style={styles.tipText}>
                            Tập thể dục ít nhất 30 phút mỗi ngày.
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>•</Text>
                        <Text style={styles.tipText}>
                            Giữ chế độ ăn uống cân bằng, giảm đường và chất béo.
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>•</Text>
                        <Text style={styles.tipText}>
                            Uống đủ nước và ngủ đủ giấc.
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.shortcuts}>
                    <TouchableOpacity
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#ECFDF5" },
                        ]}
                    >
                        <Text style={styles.shortcutEmoji}>❤️</Text>
                        <Text style={styles.shortcutTitle}>
                            Theo dõi trực tiếp
                        </Text>
                        <Text style={styles.shortcutDesc}>
                            Xem nhịp tim hiện tại
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#EFF6FF" },
                        ]}
                    >
                        <Text style={styles.shortcutEmoji}>📊</Text>
                        <Text style={styles.shortcutTitle}>Báo cáo tháng</Text>
                        <Text style={styles.shortcutDesc}>
                            Xem biểu đồ chi tiết
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
    header: { marginBottom: 16 },
    headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
    headerSubtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    card: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    cardMain: {
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    cardLabel: { fontSize: 12, color: "#059669", fontWeight: "700" },
    cardValue: {
        fontSize: 26,
        fontWeight: "800",
        color: "#065F46",
        marginVertical: 6,
    },
    cardHint: { fontSize: 12, color: "#6B7280" },

    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "700",
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
    bar: { width: 14, borderRadius: 8 },
    barLabel: { marginTop: 6, fontSize: 12, color: "#475569" },
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
    tipItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 6,
    },
    tipDot: { color: "#EF4444", fontSize: 16, marginRight: 6 },
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
