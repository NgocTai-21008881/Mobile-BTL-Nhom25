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
import {
    fetchDailyActivity,
    RangeKey,
    fetchActivityByMonthYear,
} from "../services/activityService";

export default function DoubleSupportScreen() {
    const [graphData, setGraphData] = useState<number[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState<RangeKey>("week");
    const [goal, setGoal] = useState(10000);
    const [userId, setUserId] = useState<string | null>(null);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalInput, setGoalInput] = useState("10000");
    const [showDateModal, setShowDateModal] = useState(false);
    const [tempMonth, setTempMonth] = useState(new Date().getMonth() + 1);
    const [tempYear, setTempYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    }, [selectedRange, userId, selectedMonth, selectedYear]);

    const loadData = async (range: RangeKey) => {
        try {
            setLoading(true);
            let data;
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            if (
                selectedMonth !== currentMonth ||
                selectedYear !== currentYear
            ) {
                data = await fetchActivityByMonthYear(
                    userId!,
                    selectedMonth,
                    selectedYear
                );
            } else {
                data = await fetchDailyActivity(userId!, range);
            }

            if (!data || data.length === 0) {
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
        } catch (e) {
            console.error("Lỗi tải dữ liệu:", e);
            setGraphData([]);
            setLabels([]);
        } finally {
            setLoading(false);
        }
    };

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
            `Mục tiêu: ${newGoal.toLocaleString("vi-VN")} bước`
        );
    };

    const handleConfirmDate = () => {
        setSelectedMonth(tempMonth);
        setSelectedYear(tempYear);
        setShowDateModal(false);
    };

    const monthNames = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
    ];
    const yearOptions = Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - 2 + i
    );

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
                    Đang tải...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View>
                        <Text style={styles.headerTitle}>Số Bước Hôm Nay</Text>
                        <Text style={styles.headerSubtitle}>
                            Theo dõi hoạt động của bạn
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.dateButton2}
                        onPress={() => setShowDateModal(true)}
                    >
                        <AntDesign name="calendar" size={20} color="#5865F2" />
                    </TouchableOpacity>
                </View>

                {/* Main Stats - Circle Progress */}
                <View style={styles.statsCard}>
                    <View style={styles.circleContainer}>
                        <View
                            style={[
                                styles.circleProgress,
                                {
                                    borderColor:
                                        progress >= 1 ? "#10B981" : "#5865F2",
                                },
                            ]}
                        >
                            <View style={styles.circleInner}>
                                <Text style={styles.circleValue}>
                                    {Math.round(progress * 100)}%
                                </Text>
                                <Text style={styles.circleLabel}>Mục tiêu</Text>
                            </View>
                        </View>
                    </View>

                    {/* Stats Below Circle */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>
                                {avg.toLocaleString("vi-VN")}
                            </Text>
                            <Text style={styles.statName}>Trung bình</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>
                                {goal.toLocaleString("vi-VN")}
                            </Text>
                            <Text style={styles.statName}>Mục tiêu</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.goalSetBtn}
                        onPress={() => setShowGoalModal(true)}
                    >
                        <AntDesign name="edit" size={16} color="#fff" />
                        <Text style={styles.goalSetBtnText}>
                            Thay đổi mục tiêu
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Range Selector */}
                <View style={styles.rangeSelector}>
                    {(["week", "month", "quarter"] as RangeKey[]).map((r) => (
                        <TouchableOpacity
                            key={r}
                            onPress={() => setSelectedRange(r)}
                            style={[
                                styles.rangeBtn,
                                selectedRange === r && styles.rangeBtnActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.rangeText,
                                    selectedRange === r &&
                                        styles.rangeTextActive,
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
                    <View style={styles.loadingBar}>
                        <ActivityIndicator size="small" color="#5865F2" />
                        <Text style={styles.loadingText}>
                            Cập nhật dữ liệu...
                        </Text>
                    </View>
                )}

                {/* Chart */}
                {!loading && graphData.length > 0 && (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Biểu Đồ Bước</Text>
                        <View style={styles.chartArea}>
                            {graphData.map((v, i) => {
                                const h = Math.max(10, (v / maxVal) * 150);
                                const isMax = v === Math.max(...graphData);
                                return (
                                    <View key={i} style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: h,
                                                    backgroundColor: isMax
                                                        ? "#10B981"
                                                        : "#5865F2",
                                                },
                                            ]}
                                        />
                                        <Text style={styles.barLabel}>
                                            {labels[i]}
                                        </Text>
                                        <Text style={styles.barValue}>
                                            {(v / 1000).toFixed(1)}k
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Tips Card */}
                <View style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <AntDesign name="bulb1" size={20} color="#FFB800" />
                        <Text style={styles.tipsTitle}>Mẹo Sức Khỏe</Text>
                    </View>
                    <Text style={styles.tipsText}>
                        • Đi bộ nhẹ nhàng 5-10 phút sau mỗi giờ làm việc
                    </Text>
                    <Text style={styles.tipsText}>
                        • Chọn thang bộ thay vì thang máy
                    </Text>
                    <Text style={styles.tipsText}>
                        • Tăng mục tiêu 500 bước mỗi tuần
                    </Text>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>

            {/* Date Modal */}
            <Modal
                visible={showDateModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent2}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Chọn Tháng & Năm
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDateModal(false)}
                            >
                                <AntDesign
                                    name="close"
                                    size={24}
                                    color="#0F172A"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.dateLabel}>Tháng</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.monthScroll}
                        >
                            {monthNames.map((month, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setTempMonth(idx + 1)}
                                    style={[
                                        styles.monthBtn,
                                        tempMonth === idx + 1 &&
                                            styles.monthBtnActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.monthText,
                                            tempMonth === idx + 1 &&
                                                styles.monthTextActive,
                                        ]}
                                    >
                                        {month}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.dateLabel}>Năm</Text>
                        <View style={styles.yearGrid}>
                            {yearOptions.map((year) => (
                                <TouchableOpacity
                                    key={year}
                                    onPress={() => setTempYear(year)}
                                    style={[
                                        styles.yearBtn,
                                        tempYear === year &&
                                            styles.yearBtnActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.yearText,
                                            tempYear === year &&
                                                styles.yearTextActive,
                                        ]}
                                    >
                                        {year}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.previewBox}>
                            <Text style={styles.previewText}>
                                📅 {monthNames[tempMonth - 1]} năm {tempYear}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.confirmBtn2}
                            onPress={handleConfirmDate}
                        >
                            <Text style={styles.confirmBtnText2}>
                                Xem Dữ Liệu
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Goal Modal */}
            <Modal
                visible={showGoalModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowGoalModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent2}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Đặt Mục Tiêu Bước
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowGoalModal(false)}
                            >
                                <AntDesign
                                    name="close"
                                    size={24}
                                    color="#0F172A"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtext}>
                            Nhập số bước bạn muốn đạt mỗi ngày
                        </Text>

                        <TextInput
                            style={styles.goalInput2}
                            placeholder="Ví dụ: 10000"
                            placeholderTextColor="#B0B9C9"
                            value={goalInput}
                            onChangeText={setGoalInput}
                            keyboardType="number-pad"
                        />

                        <TouchableOpacity
                            style={styles.confirmBtn2}
                            onPress={handleSetGoal}
                        >
                            <Text style={styles.confirmBtnText2}>Xác Nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },

    headerCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 16,
        elevation: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
    headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 4 },
    dateButton2: {
        backgroundColor: "#F0F4FF",
        padding: 10,
        borderRadius: 10,
    },

    statsCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderRadius: 20,
        elevation: 2,
    },
    circleContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    circleProgress: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        borderColor: "#5865F2",
        justifyContent: "center",
        alignItems: "center",
    },
    circleInner: {
        alignItems: "center",
    },
    circleValue: {
        fontSize: 32,
        fontWeight: "900",
        color: "#0F172A",
    },
    circleLabel: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },

    statsGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    statNumber: {
        fontSize: 18,
        fontWeight: "800",
        color: "#5865F2",
    },
    statName: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 4,
    },

    goalSetBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#5865F2",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    goalSetBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },

    rangeSelector: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginBottom: 20,
        gap: 8,
    },
    rangeBtn: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#E9EEF5",
        borderRadius: 10,
    },
    rangeBtnActive: {
        backgroundColor: "#5865F2",
    },
    rangeText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#55627A",
        textAlign: "center",
    },
    rangeTextActive: {
        color: "#fff",
        fontWeight: "700",
    },

    loadingBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E0E7FF",
        marginHorizontal: 16,
        marginBottom: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    loadingText: {
        fontSize: 13,
        color: "#5865F2",
        fontWeight: "600",
    },

    chartCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 16,
        elevation: 1,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 16,
    },
    chartArea: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 180,
        paddingHorizontal: 4,
    },
    barContainer: {
        alignItems: "center",
        flex: 1,
    },
    bar: {
        width: 18,
        backgroundColor: "#5865F2",
        borderRadius: 6,
        marginBottom: 8,
    },
    barLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 2,
    },
    barValue: {
        fontSize: 10,
        color: "#64748B",
        fontWeight: "600",
    },

    tipsCard: {
        backgroundColor: "#FFF8E6",
        marginHorizontal: 16,
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderLeftWidth: 4,
        borderLeftColor: "#FFB800",
    },
    tipsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 8,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    tipsText: {
        fontSize: 12,
        color: "#374151",
        lineHeight: 18,
        marginBottom: 6,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    modalContent2: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0F172A",
    },
    modalSubtext: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 16,
    },

    dateLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 10,
    },
    monthScroll: {
        marginBottom: 20,
    },
    monthBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 8,
        marginRight: 8,
    },
    monthBtnActive: {
        backgroundColor: "#5865F2",
    },
    monthText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#374151",
    },
    monthTextActive: {
        color: "#fff",
        fontWeight: "700",
    },

    yearGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    yearBtn: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 4,
        backgroundColor: "#E5E7EB",
        borderRadius: 8,
        alignItems: "center",
    },
    yearBtnActive: {
        backgroundColor: "#5865F2",
    },
    yearText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#374151",
    },
    yearTextActive: {
        color: "#fff",
        fontWeight: "700",
    },

    previewBox: {
        backgroundColor: "#F0F4FF",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginBottom: 16,
    },
    previewText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
    },

    goalInput2: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: "#0F172A",
        marginBottom: 16,
        backgroundColor: "#F9FAFB",
    },

    confirmBtn2: {
        backgroundColor: "#5865F2",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    confirmBtnText2: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
    },
});
