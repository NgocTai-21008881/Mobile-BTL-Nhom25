import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Alert,
    Animated,
    Dimensions,
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchDailyActivity } from "../services/activityService";
import {
    getSleepSchedule,
    updateSleepSchedule,
    calculateDeepSleep,
    evaluateSleepQuality,
} from "../services/sleepService";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

interface SleepData {
    date: string;
    sleep_hours: number;
}

export default function SleepScreen() {
    const [sleepData, setSleepData] = useState<SleepData[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [bedtime, setBedtime] = useState<string>("22:00");
    const [wakeUpTime, setWakeUpTime] = useState<string>("07:00");
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    const [editingTime, setEditingTime] = useState<"bedtime" | "wakeup" | null>(
        null
    );
    const [tempHour, setTempHour] = useState(0);
    const [tempMinute, setTempMinute] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTab, setSelectedTab] = useState<
        "today" | "weekly" | "monthly"
    >("weekly");

    useEffect(() => {
        (async () => {
            try {
                const { data } = await supabase.auth.getUser();
                if (data?.user?.id) {
                    setUserId(data.user.id);
                } else {
                    console.warn("No user ID found");
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error getting user:", error);
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!userId) return;
        loadData();
    }, [userId, selectedTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            const period =
                selectedTab === "today"
                    ? "week"
                    : selectedTab === "weekly"
                    ? "week"
                    : "month";

            const data = await fetchDailyActivity(userId!, period);
            console.log("Fetched sleep data:", data);

            if (data && data.length > 0) {
                setSleepData(data);
            } else {
                console.warn("No sleep data returned");
                setSleepData([]);
            }

            const schedule = await getSleepSchedule(userId!);
            console.log("Fetched schedule:", schedule);

            if (schedule) {
                setBedtime(schedule.bedtime || "22:00");
                setWakeUpTime(schedule.wakeup_time || "07:00");
            }
        } catch (e) {
            console.error("Error loading data:", e);
            setSleepData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTimePress = (type: "bedtime" | "wakeup") => {
        const timeStr = type === "bedtime" ? bedtime : wakeUpTime;
        const [h, m] = timeStr.split(":").map(Number);
        setTempHour(h);
        setTempMinute(m);
        setEditingTime(type);
        setTimeModalVisible(true);
    };

    const handleSaveTime = async () => {
        try {
            setIsSaving(true);
            const timeStr = `${String(tempHour).padStart(2, "0")}:${String(
                tempMinute
            ).padStart(2, "0")}`;
            const newBedtime = editingTime === "bedtime" ? timeStr : bedtime;
            const newWakeup = editingTime === "wakeup" ? timeStr : wakeUpTime;

            if (editingTime === "bedtime") setBedtime(timeStr);
            else setWakeUpTime(timeStr);

            const { success } = await updateSleepSchedule(
                userId!,
                newBedtime,
                newWakeup
            );
            if (success) {
                setTimeModalVisible(false);
                setEditingTime(null);
            } else {
                Alert.alert("Error", "Cannot update sleep schedule");
            }
        } catch (e) {
            Alert.alert("Error", "Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#00BCD4" />
            </View>
        );
    }

    // Kiểm tra nếu không có userId
    if (!userId) {
        return (
            <View style={styles.container}>
                <Text
                    style={{
                        textAlign: "center",
                        marginTop: 20,
                        color: "#666",
                    }}
                >
                    Please log in first
                </Text>
            </View>
        );
    }

    // Tính toán trung bình giấc ngủ
    const avgSleep = useMemo(() => {
        if (!sleepData || sleepData.length === 0) return 0;
        const total = sleepData.reduce(
            (sum, d) => sum + (d.sleep_hours || 0),
            0
        );
        return total / sleepData.length;
    }, [sleepData]);

    const deepSleep = calculateDeepSleep(avgSleep);
    const sleepQuality = evaluateSleepQuality(avgSleep);

    // Format thời gian từ HH:mm sang hh:mm AM/PM
    const formatTime12Hour = (time: string): string => {
        const [hours, minutes] = time.split(":").map(Number);
        const period = hours >= 12 ? "pm" : "am";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
    };

    // Lấy ngày trong tuần
    const getDayLabels = (): string[] => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const labels: string[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            labels.push(days[date.getDay()]);
        }
        return labels;
    };

    const dayLabels = getDayLabels();

    // Tạo dữ liệu cột cho biểu đồ
    const chartData = useMemo(() => {
        const today = new Date();
        const data: number[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            const sleepItem = sleepData.find((d) => d.date === dateStr);
            data.push(sleepItem?.sleep_hours || 0);
        }
        return data;
    }, [sleepData]);

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => {}}>
                    <AntDesign name="left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sleep</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Main Stats Card */}
            <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>Your average time of</Text>
                <Text style={styles.statsPeriod}>sleep a day is</Text>
                <Text style={styles.statsValue}>
                    {Math.floor(avgSleep)}h {Math.round((avgSleep % 1) * 60)}
                    <Text style={styles.statsUnit}>min</Text>
                </Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedTab === "today" && styles.tabActive,
                    ]}
                    onPress={() => setSelectedTab("today")}
                >
                    <Text
                        style={[
                            styles.tabButtonText,
                            selectedTab === "today" && styles.tabActiveText,
                        ]}
                    >
                        Today
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedTab === "weekly" && styles.tabActive,
                    ]}
                    onPress={() => setSelectedTab("weekly")}
                >
                    <Text
                        style={[
                            styles.tabButtonText,
                            selectedTab === "weekly" && styles.tabActiveText,
                        ]}
                    >
                        Weekly
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedTab === "monthly" && styles.tabActive,
                    ]}
                    onPress={() => setSelectedTab("monthly")}
                >
                    <Text
                        style={[
                            styles.tabButtonText,
                            selectedTab === "monthly" && styles.tabActiveText,
                        ]}
                    >
                        Monthly
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                <View style={styles.chartBars}>
                    {chartData.map((hours, index) => (
                        <View key={index} style={styles.barWrapper}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: Math.max((hours / 10) * 100, 8),
                                        backgroundColor:
                                            hours > 0 ? "#00BCD4" : "#E0F7FA",
                                    },
                                ]}
                            />
                        </View>
                    ))}
                </View>
                <View style={styles.dayLabelsContainer}>
                    {dayLabels.map((day, index) => (
                        <Text key={index} style={styles.dayLabel}>
                            {day}
                        </Text>
                    ))}
                </View>
            </View>

            {/* Sleep Metrics */}
            <View style={styles.metricsContainer}>
                <View style={styles.metricBox}>
                    <Text style={styles.metricIcon}>⭐</Text>
                    <Text style={styles.metricValue}>
                        {Math.round((avgSleep / 8) * 100)}%
                    </Text>
                    <Text style={styles.metricLabel}>Sleep rate</Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricIcon}>😴</Text>
                    <Text style={styles.metricValue}>{deepSleep.time}</Text>
                    <Text style={styles.metricLabel}>Deepsleep</Text>
                </View>
            </View>

            {/* Schedule Section */}
            <View style={styles.scheduleSection}>
                <View style={styles.scheduleHeader}>
                    <Text style={styles.scheduleTitle}>Set your schedule</Text>
                    <TouchableOpacity
                        onPress={() => setTimeModalVisible(false)}
                    >
                        <Text style={styles.editButton}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.timeButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.timeButton, styles.bedtimeButton]}
                        onPress={() => handleTimePress("bedtime")}
                    >
                        <View style={styles.timeButtonContent}>
                            <AntDesign name="star" size={20} color="#fff" />
                            <Text style={styles.timeButtonLabel}>Bedtime</Text>
                        </View>
                        <Text style={styles.timeButtonValue}>
                            {formatTime12Hour(bedtime)}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.timeButton, styles.wakeupButton]}
                        onPress={() => handleTimePress("wakeup")}
                    >
                        <View style={styles.timeButtonContent}>
                            <MaterialCommunityIcons
                                name="weather-sunny"
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.timeButtonLabel}>Wake up</Text>
                        </View>
                        <Text style={styles.timeButtonValue}>
                            {formatTime12Hour(wakeUpTime)}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Time Picker Modal */}
            <Modal visible={timeModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => setTimeModalVisible(false)}
                            >
                                <AntDesign
                                    name="close"
                                    size={28}
                                    color="#333"
                                />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {editingTime === "bedtime"
                                    ? "Set Bedtime"
                                    : "Set Wake Up Time"}
                            </Text>
                            <View style={{ width: 28 }} />
                        </View>

                        <View style={styles.timePicker}>
                            <View style={styles.timePickerColumn}>
                                <Text style={styles.timePickerLabel}>Hour</Text>
                                <View style={styles.timePickerBox}>
                                    <TouchableOpacity
                                        style={styles.timePickerBtn}
                                        onPress={() =>
                                            setTempHour(
                                                tempHour === 0
                                                    ? 23
                                                    : tempHour - 1
                                            )
                                        }
                                    >
                                        <AntDesign
                                            name="minus"
                                            size={28}
                                            color="#00BCD4"
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.timePickerValue}>
                                        {String(tempHour).padStart(2, "0")}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.timePickerBtn}
                                        onPress={() =>
                                            setTempHour(
                                                tempHour === 23
                                                    ? 0
                                                    : tempHour + 1
                                            )
                                        }
                                    >
                                        <AntDesign
                                            name="plus"
                                            size={28}
                                            color="#00BCD4"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.separator}>:</Text>

                            <View style={styles.timePickerColumn}>
                                <Text style={styles.timePickerLabel}>
                                    Minute
                                </Text>
                                <View style={styles.timePickerBox}>
                                    <TouchableOpacity
                                        style={styles.timePickerBtn}
                                        onPress={() =>
                                            setTempMinute(
                                                tempMinute === 0
                                                    ? 59
                                                    : tempMinute - 1
                                            )
                                        }
                                    >
                                        <AntDesign
                                            name="minus"
                                            size={28}
                                            color="#00BCD4"
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.timePickerValue}>
                                        {String(tempMinute).padStart(2, "0")}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.timePickerBtn}
                                        onPress={() =>
                                            setTempMinute(
                                                tempMinute === 59
                                                    ? 0
                                                    : tempMinute + 1
                                            )
                                        }
                                    >
                                        <AntDesign
                                            name="plus"
                                            size={28}
                                            color="#00BCD4"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.confirmBtn,
                                isSaving && { opacity: 0.6 },
                            ]}
                            onPress={handleSaveTime}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmBtnText}>
                                    Confirm
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
    },
    statsCard: {
        marginHorizontal: 20,
        marginBottom: 24,
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
        alignItems: "center",
    },
    statsLabel: {
        fontSize: 16,
        color: "#666",
        marginBottom: 4,
    },
    statsPeriod: {
        fontSize: 16,
        color: "#666",
        marginBottom: 12,
    },
    statsValue: {
        fontSize: 32,
        fontWeight: "700",
        color: "#00BCD4",
    },
    statsUnit: {
        fontSize: 18,
        fontWeight: "600",
        color: "#00BCD4",
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 25,
        backgroundColor: "#E0F7FA",
    },
    tabActive: {
        backgroundColor: "#00BCD4",
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#00BCD4",
    },
    tabActiveText: {
        color: "#fff",
        fontWeight: "600",
    },
    chartContainer: {
        marginHorizontal: 20,
        marginBottom: 32,
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
    },
    chartBars: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 140,
        marginBottom: 16,
    },
    barWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        marginHorizontal: 6,
    },
    bar: {
        width: "100%",
        borderRadius: 6,
        minHeight: 8,
    },
    dayLabelsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    dayLabel: {
        flex: 1,
        fontSize: 12,
        color: "#999",
        textAlign: "center",
    },
    metricsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 20,
        marginBottom: 32,
        gap: 16,
    },
    metricBox: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
        alignItems: "center",
    },
    metricIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: "#999",
    },
    scheduleSection: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    scheduleHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    scheduleTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    editButton: {
        fontSize: 14,
        fontWeight: "600",
        color: "#00BCD4",
    },
    timeButtonsContainer: {
        flexDirection: "row",
        gap: 12,
    },
    timeButton: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 12,
        justifyContent: "space-between",
    },
    bedtimeButton: {
        backgroundColor: "#FF6B6B",
    },
    wakeupButton: {
        backgroundColor: "#FFA500",
    },
    timeButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    timeButtonLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    timeButtonValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
    },
    timePicker: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
    },
    timePickerColumn: {
        alignItems: "center",
    },
    timePickerLabel: {
        fontSize: 12,
        color: "#999",
        fontWeight: "600",
        marginBottom: 12,
    },
    timePickerBox: {
        alignItems: "center",
    },
    timePickerBtn: {
        padding: 12,
    },
    timePickerValue: {
        fontSize: 44,
        fontWeight: "800",
        color: "#333",
        width: 60,
        textAlign: "center",
    },
    separator: {
        fontSize: 36,
        fontWeight: "700",
        color: "#00BCD4",
        marginHorizontal: 12,
    },
    confirmBtn: {
        backgroundColor: "#00BCD4",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    confirmBtnText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
});
