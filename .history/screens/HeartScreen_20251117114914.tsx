import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { fetchDailyActivity } from "../services/activityService";
import { supabase } from "../lib/supabase";

export default function HeartScreen() {
    const [heartData, setHeartData] = useState<number[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user?.id) setUserId(data.user.id);
        })();
    }, []);

    useEffect(() => {
        if (!userId) return;
        loadHeartData();
    }, [userId]);

    const loadHeartData = async () => {
        try {
            setLoading(true);
            const data = await fetchDailyActivity(userId!, "week");
            if (data.length > 0) {
                setHeartData(data.map((d: any) => d.heart_rate || 70 + Math.random() * 30));
                setLabels(
                    data.map((d: any) =>
                        new Date(d.date).toLocaleDateString("vi-VN", {
                            weekday: "short",
                        })
                    )
                );
            } else {
                // Dữ liệu mẫu
                setHeartData([72, 68, 75, 71, 80, 76, 74]);
                setLabels(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
            }
        } catch (e) {
            console.error("Lỗi tải nhịp tim:", e);
            // Dữ liệu fallback
            setHeartData([72, 68, 75, 71, 80, 76, 74]);
            setLabels(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
        } finally {
            setLoading(false);
        }
    };

    const avgHeart = useMemo(
        () =>
            heartData.length > 0
                ? Math.round(
                      heartData.reduce((a, b) => a + b, 0) / heartData.length
                  )
                : 0,
        [heartData]
    );

    const maxHeart = useMemo(
        () => (heartData.length > 0 ? Math.max(...heartData) : 100),
        [heartData]
    );

    const minHeart = useMemo(
        () => (heartData.length > 0 ? Math.min(...heartData) : 60),
        [heartData]
    );

    const status = useMemo(() => {
        if (avgHeart < 60) return "Thấp";
        if (avgHeart <= 100) return "Bình thường";
        return "Cao";
    }, [avgHeart]);

    const statusColor =
        status === "Bình thường" ? "#5865F2" : status === "Cao" ? "#EF4444" : "#3B82F6";
    const statusBgColor =
        status === "Bình thường"
            ? "#EFF6FF"
            : status === "Cao"
            ? "#FEE2E2"
            : "#DBEAFE";

    if (loading) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <ActivityIndicator size="large" color="#5865F2" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Nhịp Tim</Text>
                <Text style={styles.headerSubtitle}>Theo dõi sức khỏe tim mạch của bạn</Text>
            </View>

            {/* Heart Card - Điểm nhấn chính */}
            <View style={[styles.heartCard, { borderColor: statusColor }]}>
                <View style={styles.heartCardContent}>
                    <Text style={styles.heartIcon}>💓</Text>
                    <Text style={[styles.cardValue, { color: statusColor }]}>
                        {avgHeart}
                    </Text>
                    <Text style={styles.cardUnit}>bpm</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {status}
                    </Text>
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <AntDesign name="arrow-up" size={16} color="#EF4444" />
                        <Text style={styles.statLabel}>Cao nhất</Text>
                    </View>
                    <Text style={styles.statValue}>{maxHeart}</Text>
                    <Text style={styles.statUnit}>bpm</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <AntDesign name="arrowdown" size={16} color="#3B82F6" />
                        <Text style={styles.statLabel}>Thấp nhất</Text>
                    </View>
                    <Text style={styles.statValue}>{minHeart}</Text>
                    <Text style={styles.statUnit}>bpm</Text>
                </View>
            </View>

            {/* Biểu đồ */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Diễn biến nhịp tim trong tuần</Text>
                <View style={styles.chartArea}>
                    {heartData.map((v, i) => {
                        const barHeight = (v / maxHeart) * 120;
                        const isSelected = selectedDay === i;
                        return (
                            <TouchableOpacity
                                key={i}
                                style={styles.barWrap}
                                onPress={() => setSelectedDay(isSelected ? null : i)}
                            >
                                <View style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: barHeight,
                                                backgroundColor: isSelected
                                                    ? "#5865F2"
                                                    : "#A0C4FF",
                                            },
                                        ]}
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.barLabel,
                                        isSelected && styles.barLabelSelected,
                                    ]}
                                >
                                    {labels[i]}
                                </Text>
                                {isSelected && (
                                    <Text style={styles.barValue}>{v} bpm</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Hướng dẫn */}
            <View style={styles.guideCard}>
                <Text style={styles.guideTitle}>📚 Hướng dẫn sức khỏe tim mạch</Text>

                <View style={styles.guideItem}>
                    <View style={styles.guideIcon}>
                        <Text style={styles.guideEmoji}>✅</Text>
                    </View>
                    <View style={styles.guideContent}>
                        <Text style={styles.guideItemTitle}>Nhịp tim bình thường</Text>
                        <Text style={styles.guideItemDesc}>60 - 100 bpm (tại trạng thái nghỉ)</Text>
                    </View>
                </View>

                <View style={styles.guideItem}>
                    <View style={styles.guideIcon}>
                        <Text style={styles.guideEmoji}>⚠️</Text>
                    </View>
                    <View style={styles.guideContent}>
                        <Text style={styles.guideItemTitle}>Nhịp tim cao</Text>
                        <Text style={styles.guideItemDesc}>Trên 100 bpm - liên hệ bác sĩ</Text>
                    </View>
                </View>

                <View style={styles.guideItem}>
                    <View style={styles.guideIcon}>
                        <Text style={styles.guideEmoji}>⚠️</Text>
                    </View>
                    <View style={styles.guideContent}>
                        <Text style={styles.guideItemTitle}>Nhịp tim thấp</Text>
                        <Text style={styles.guideItemDesc}>Dưới 60 bpm - tập thể dục đều đặn</Text>
                    </View>
                </View>
            </View>

            {/* Lời khuyên */}
            <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Lời khuyên cải thiện tim mạch</Text>
                <View style={styles.tipItem}>
                    <Text style={styles.tipNumber}>1</Text>
                    <Text style={styles.tipText}>Tập thể dục aerobic 150 phút/tuần</Text>
                </View>
                <View style={styles.tipItem}>
                    <Text style={styles.tipNumber}>2</Text>
                    <Text style={styles.tipText}>Giảm căng thẳng qua thiền định</Text>
                </View>
                <View style={styles.tipItem}>
                    <Text style={styles.tipNumber}>3</Text>
                    <Text style={styles.tipText}>Ăn lành mạnh, giảm muối và béo</Text>
                </View>
                <View style={styles.tipItem}>
                    <Text style={styles.tipNumber}>4</Text>
                    <Text style={styles.tipText}>Ngủ đủ 7-8 giờ mỗi đêm</Text>
                </View>
            </View>
        </ScrollView>
    );
}

            {/* Chart */}
            <View style={styles.chartCard}>
                <View style={styles.chartArea}>
                    {heartData.map((v, i) => (
                        <View key={i} style={styles.barWrap}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: Math.max(20, (v / 150) * 120),
                                        backgroundColor: statusColor,
                                    },
                                ]}
                            />
                            <Text style={styles.barLabel}>{labels[i]}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Thông tin</Text>
                <Text style={styles.infoText}>
                    • Nhịp tim bình thường: 60-100 bpm
                </Text>
                <Text style={styles.infoText}>
                    • Kiểm tra định kỳ mỗi ngày
                </Text>
                <Text style={styles.infoText}>
                    • Tập luyện giúp cải thiện sức khỏe tim mạch
                </Text>
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
    header: { marginBottom: 24 },
    headerTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 4,
    },
    headerSubtitle: { fontSize: 14, color: "#64748B", marginBottom: 8 },

    // Heart Card
    heartCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 28,
        borderWidth: 3,
        alignItems: "center",
        marginBottom: 24,
        shadowColor: "#5865F2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    heartCardContent: {
        alignItems: "center",
        marginBottom: 16,
    },
    heartIcon: { fontSize: 56, marginBottom: 12 },
    cardValue: {
        fontSize: 56,
        fontWeight: "900",
    },
    cardUnit: { fontSize: 14, color: "#64748B", fontWeight: "600", marginTop: 4 },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        marginTop: 12,
    },
    statusText: { fontSize: 14, fontWeight: "700" },

    // Stats Row
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignItems: "center",
    },
    statHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 6,
    },
    statLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
    statValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 4,
    },
    statUnit: { fontSize: 11, color: "#9CA3AF", fontWeight: "600" },

    // Chart
    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 16,
    },
    chartArea: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 160,
        marginBottom: 12,
    },
    barWrap: { alignItems: "center", flex: 1 },
    barContainer: { justifyContent: "flex-end", height: 120 },
    bar: { width: 16, borderRadius: 8, marginHorizontal: 4 },
    barLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 8, fontWeight: "600" },
    barLabelSelected: { color: "#5865F2", fontWeight: "800" },
    barValue: {
        fontSize: 11,
        color: "#5865F2",
        fontWeight: "800",
        marginTop: 4,
    },

    // Guide Card
    guideCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    guideTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A", marginBottom: 16 },
    guideItem: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "flex-start",
    },
    guideIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#F0F4FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    guideEmoji: { fontSize: 20 },
    guideContent: { flex: 1 },
    guideItemTitle: { fontSize: 13, fontWeight: "700", color: "#0F172A", marginBottom: 4 },
    guideItemDesc: { fontSize: 12, color: "#6B7280" },

    // Tips Card
    tipsCard: {
        backgroundColor: "#EFF6FF",
        borderRadius: 16,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#5865F2",
    },
    tipsTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A", marginBottom: 16 },
    tipItem: {
        flexDirection: "row",
        marginBottom: 12,
        alignItems: "center",
    },
    tipNumber: {
        fontSize: 14,
        fontWeight: "800",
        color: "#5865F2",
        marginRight: 12,
        minWidth: 24,
    },
    tipText: { fontSize: 13, color: "#334155", flex: 1, lineHeight: 20 },
});