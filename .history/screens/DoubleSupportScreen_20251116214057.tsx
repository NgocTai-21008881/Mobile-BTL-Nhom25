import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { fetchDailyActivity, RangeKey } from "../services/activityService";

export default function DoubleSupportScreen() {
    const [graphData, setGraphData] = useState<number[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState<RangeKey>("week");
    const [goal, setGoal] = useState(10000);
    const [userId, setUserId] = useState<string | null>(null);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalInput, setGoalInput] = useState("10000");

    // Lấy user ID
    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user?.id) {
                setUserId(data.user.id);
            }
        })();
    }, []);

    // Load dữ liệu từ Supabase
    useEffect(() => {
        if (!userId) return;
        loadData(selectedRange);
    }, [selectedRange, userId]);

    const loadData = async (range: RangeKey) => {
        try {
            setLoading(true);
            console.log(`📊 Loading data for range: ${range}`);
            const data = await fetchDailyActivity(userId!, range);
            console.log(`✅ Data loaded (${range}):`, data);

            if (!data || data.length === 0) {
                console.warn("⚠️ Không có dữ liệu cho range này");
                setGraphData([]);
                setLabels([]);
                return;
            }

            const steps = data.map((d: any) => d.steps || 0);
            setGraphData(steps);

            const dayLabels = data.map((d: any) => {
                const date = new Date(d.date);
                if (range === "week") {
                    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
                    return days[date.getDay()] || "?";
                }
                return date.getDate().toString();
            });
            setLabels(dayLabels);

            console.log(`📈 Steps: ${steps}`, `📋 Labels: ${dayLabels}`);
        } catch (e) {
            console.error("Lỗi tải dữ liệu:", e);
            setGraphData([]);
            setLabels([]);
        } finally {
            setLoading(false);
        }
    };

    // Tính toán
    const maxVal = useMemo(
        () => Math.max(goal, ...graphData),
        [graphData, goal]
    );
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

    // Handle set goal
    const handleSetGoal = () => {
        const newGoal = parseInt(goalInput);
        if (isNaN(newGoal) || newGoal <= 0) {
            Alert.alert("❌ Lỗi", "Vui lòng nhập số hợp lệ");
            return;
        }
        setGoal(newGoal);
        setShowGoalModal(false);
        Alert.alert(
            "✅ Thành công",
            `Mục tiêu đã được cập nhật thành ${newGoal.toLocaleString(
                "vi-VN"
            )} bước`
        );
    };

    // Handle share
    const handleShare = () => {
        const message = `📊 Tôi đã đạt trung bình ${avg.toLocaleString(
            "vi-VN"
        )} bước trong ${
            selectedRange === "week"
                ? "tuần"
                : selectedRange === "month"
                ? "tháng"
                : "quý"
        } này! 🎉`;
        Alert.alert("Share", message);
    };
    if (loading && graphData.length === 0) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <ActivityIndicator size="large" color="#5865F2" />
                <Text style={{ color: "#64748B", marginTop: 10 }}>
                    Đang tải dữ liệu...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Số Bước</Text>
                    <Text style={styles.subtitle}>
                        Theo dõi hoạt động hàng ngày
                    </Text>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.goalBtn}
                        onPress={() => setShowGoalModal(true)}
                    >
                        <AntDesign name="trophy" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.shareBtn}
                        onPress={handleShare}
                    >
                        <AntDesign name="share-alt" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Range Selector */}
                <View style={styles.segmentWrap}>
                    {(["week", "month", "quarter"] as RangeKey[]).map((r) => (
                        <TouchableOpacity
                            key={r}
                            onPress={() => setSelectedRange(r)}
                            style={[
                                styles.segmentBtn,
                                selectedRange === r && styles.segmentBtnActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.segmentText,
                                    selectedRange === r &&
                                        styles.segmentTextActive,
                                ]}
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

                {loading && (
                    <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="small" color="#5865F2" />
                        <Text style={styles.loadingText}>
                            Cập nhật dữ liệu...
                        </Text>
                    </View>
                )}

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Trung bình</Text>
                        <Text style={styles.statValue}>
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
                        <Text style={styles.statHint}>
                            Mục tiêu: {goal.toLocaleString("vi-VN")} bước
                        </Text>
                    </View>
                </View>

                {/* Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartArea}>
                        {graphData.map((v, i) => {
                            const h = Math.max(8, (v / maxVal) * 120);
                            return (
                                <View key={i} style={styles.barWrap}>
                                    <View style={[styles.bar, { height: h }]} />
                                    <Text style={styles.barLabel}>
                                        {labels[i]}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Tips */}
                <View style={styles.tipCard}>
                    <Text style={styles.tipTitle}>Gợi ý nhanh</Text>
                    <Text style={styles.tipItem}>
                        • Đi bộ 5–10 phút sau mỗi giờ làm việc.
                    </Text>
                    <Text style={styles.tipItem}>
                        • Ưu tiên đi thang bộ thay vì thang máy.
                    </Text>
                    <Text style={styles.tipItem}>
                        • Đặt mục tiêu nhỏ (+500 bước) mỗi tuần.
                    </Text>
                </View>
            </ScrollView>

            {/* Goal Setting Modal */}
            <Modal
                visible={showGoalModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowGoalModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Đặt Mục Tiêu Bước</Text>
                        <Text style={styles.modalSubtitle}>
                            Nhập số bước mục tiêu hàng ngày
                        </Text>
                        <TextInput
                            style={styles.goalInput}
                            placeholder="Nhập số bước"
                            placeholderTextColor="#B0B9C9"
                            value={goalInput}
                            onChangeText={setGoalInput}
                            keyboardType="number-pad"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setShowGoalModal(false)}
                            >
                                <Text style={styles.cancelBtnText}>Huỷ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={handleSetGoal}
                            >
                                <Text style={styles.confirmBtnText}>
                                    Xác Nhận
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F6F7FB", padding: 18 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
    subtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
    headerButtons: {
        flexDirection: "row",
        gap: 10,
    },
    goalBtn: {
        backgroundColor: "#5865F2",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    shareBtn: {
        backgroundColor: "#5865F2",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },

    segmentWrap: {
        flexDirection: "row",
        backgroundColor: "#E9EEF5",
        borderRadius: 12,
        padding: 4,
        gap: 6,
        marginBottom: 20,
    },
    segmentBtn: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    segmentBtnActive: { backgroundColor: "#fff" },
    segmentText: {
        color: "#55627A",
        fontWeight: "600",
        fontSize: 12,
        textAlign: "center",
    },
    segmentTextActive: { color: "#0F172A", fontWeight: "800" },

    statsRow: { marginBottom: 20 },
    statCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        elevation: 2,
    },
    statLabel: { fontSize: 14, color: "#6B7280", fontWeight: "700" },
    statValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "#0F172A",
        marginVertical: 8,
    },
    progressTrack: {
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressFill: { height: "100%", backgroundColor: "#5865F2" },
    statHint: { fontSize: 12, color: "#64748B" },

    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
    },
    chartArea: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 140,
    },
    barWrap: { alignItems: "center", flex: 1 },
    bar: { width: 20, backgroundColor: "#5865F2", borderRadius: 4 },
    barLabel: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 8,
        fontWeight: "600",
    },

    tipCard: { backgroundColor: "#E0E7FF", borderRadius: 16, padding: 16 },
    tipTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 12,
    },
    tipItem: {
        fontSize: 13,
        color: "#374151",
        lineHeight: 20,
        marginBottom: 8,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        width: "85%",
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 16,
    },
    goalInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: "#0F172A",
        marginBottom: 20,
        backgroundColor: "#F9FAFB",
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#E5E7EB",
        alignItems: "center",
    },
    cancelBtnText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#374151",
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#5865F2",
        alignItems: "center",
    },
    confirmBtnText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
    },
    loadingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        marginBottom: 16,
        backgroundColor: "#E0E7FF",
        borderRadius: 12,
        gap: 10,
    },
    loadingText: {
        fontSize: 12,
        color: "#5865F2",
        fontWeight: "600",
    },
});
