import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";

export default function BMIScreen() {
    // Data: giả định 7 ngày BMI trung bình (vd đo buổi sáng)
    const bmiData = [22.5, 22.6, 22.4, 22.8, 22.7, 22.9, 23.0];
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const avgBMI = useMemo(
        () => (bmiData.reduce((a, b) => a + b, 0) / bmiData.length).toFixed(1),
        [bmiData]
    );
    const category =
        avgBMI < 18.5
            ? "Thiếu cân"
            : avgBMI < 24.9
            ? "Bình thường"
            : avgBMI < 29.9
            ? "Thừa cân"
            : "Béo phì";
    const color =
        category === "Thiếu cân"
            ? "#3B82F6"
            : category === "Bình thường"
            ? "#10B981"
            : category === "Thừa cân"
            ? "#F59E0B"
            : "#EF4444";

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chỉ số BMI</Text>
                <Text style={styles.headerSubtitle}>
                    Theo dõi chỉ số cơ thể của bạn
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* BMI Summary Card */}
                <View style={[styles.card, { borderColor: color }]}>
                    <Text style={styles.cardLabel}>Chỉ số trung bình</Text>
                    <Text style={[styles.cardValue, { color }]}>{avgBMI}</Text>
                    <Text style={[styles.cardHint, { color }]}>{category}</Text>
                </View>

                {/* BMI Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>
                        Diễn biến BMI trong tuần
                    </Text>
                    <View style={styles.chartArea}>
                        {bmiData.map((v, i) => {
                            const height = (v / 30) * 120;
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
                                    { backgroundColor: "#3B82F6" },
                                ]}
                            />
                            <Text style={styles.legendText}>Thiếu cân</Text>
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
                                    { backgroundColor: "#F59E0B" },
                                ]}
                            />
                            <Text style={styles.legendText}>Thừa cân</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#EF4444" },
                                ]}
                            />
                            <Text style={styles.legendText}>Béo phì</Text>
                        </View>
                    </View>
                </View>

                {/* Health Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Giải thích nhanh</Text>
                    <View style={styles.infoRow}>
                        <Text
                            style={[
                                styles.infoBadge,
                                { backgroundColor: "#DBEAFE" },
                            ]}
                        >
                            Thiếu cân {"<18.5"}
                        </Text>
                        <Text
                            style={[
                                styles.infoBadge,
                                { backgroundColor: "#D1FAE5" },
                            ]}
                        >
                            Bình thường 18.5–24.9
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text
                            style={[
                                styles.infoBadge,
                                { backgroundColor: "#FEF3C7" },
                            ]}
                        >
                            Thừa cân 25–29.9
                        </Text>
                        <Text
                            style={[
                                styles.infoBadge,
                                { backgroundColor: "#FEE2E2" },
                            ]}
                        >
                            Béo phì ≥30
                        </Text>
                    </View>
                </View>

                {/* Tips Section */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>
                        Lời khuyên duy trì BMI khỏe mạnh
                    </Text>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>🥗</Text>
                        <Text style={styles.tipText}>
                            Ăn nhiều rau, trái cây và ngũ cốc nguyên hạt.
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>🏃</Text>
                        <Text style={styles.tipText}>
                            Tập thể dục tối thiểu 30 phút mỗi ngày.
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>💧</Text>
                        <Text style={styles.tipText}>
                            Uống đủ nước và hạn chế đồ uống có đường.
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
                        <Text style={styles.shortcutEmoji}>📊</Text>
                        <Text style={styles.shortcutTitle}>Tính lại BMI</Text>
                        <Text style={styles.shortcutDesc}>
                            Nhập cân nặng & chiều cao
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#EFF6FF" },
                        ]}
                    >
                        <Text style={styles.shortcutEmoji}>🩺</Text>
                        <Text style={styles.shortcutTitle}>
                            Tư vấn dinh dưỡng
                        </Text>
                        <Text style={styles.shortcutDesc}>
                            Xem chế độ ăn phù hợp
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

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 20,
    },
    cardLabel: { fontSize: 14, color: "#6B7280", fontWeight: "700" },
    cardValue: { fontSize: 42, fontWeight: "800", marginVertical: 4 },
    cardHint: { fontSize: 16, fontWeight: "700" },

    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
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
    bar: { width: 16, borderRadius: 8 },
    barLabel: { marginTop: 6, fontSize: 12, color: "#475569" },
    chartLegend: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    legendItem: { flexDirection: "row", alignItems: "center" },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 12, color: "#475569" },

    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    infoBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        fontSize: 12,
        color: "#111",
        fontWeight: "600",
    },

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
    tipDot: { fontSize: 16, marginRight: 8 },
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
