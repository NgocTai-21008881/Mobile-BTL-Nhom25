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
            const { data } = await supabase.auth.getUser();
            if (data?.user?.id) setUserId(data.user.id);
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
            if (data.length > 0) {
                setSleepData(data);
            }

            const schedule = await getSleepSchedule(userId!);
            setBedtime(schedule.bedtime);
            setWakeUpTime(schedule.wakeup_time);
        } catch (e) {
            console.error("Lỗi tải dữ liệu:", e);
        } finally {
            setLoading(false);
        }
    };

    // Tính trung bình giấc ngủ
    const avgSleep = useMemo(() => {
        if (sleepData.length === 0) return 0;
        const total = sleepData.reduce(
            (sum, d) => sum + (d.sleep_hours || 0),
            0
        );
        return total / sleepData.length;
    }, [sleepData]);

    const progress = Math.min(100, (avgSleep / 8) * 100); // Mục tiêu 8h
    const deepSleep = calculateDeepSleep(avgSleep);
    const sleepQuality = evaluateSleepQuality(avgSleep);

    // Tạo dữ liệu sóng
    const waveData = useMemo(() => {
        return sleepData.map((d) => d.sleep_hours);
    }, [sleepData]);

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

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Title */}
            <Text style={styles.title}>Sleep</Text>

            {/* Progress Circle */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>You have achieved</Text>
                <Text style={styles.progressPercent}>
                    {Math.round(progress)}% of your goal today
                </Text>

                <View style={styles.circleWrapper}>
                    <Svg width={220} height={220} viewBox="0 0 220 220">
                        {/* Background Circle */}
                        <Circle
                            cx="110"
                            cy="110"
                            r="100"
                            stroke="#E0F7FA"
                            strokeWidth="16"
                            fill="none"
                        />
                        {/* Progress Circle */}
                        <Circle
                            cx="110"
                            cy="110"
                            r="100"
                            stroke="#00BCD4"
                            strokeWidth="16"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 100}`}
                            strokeDashoffset={`${
                                2 * Math.PI * 100 * (1 - progress / 100)
                            }`}
                            strokeLinecap="round"
                            transform="rotate(-90 110 110)"
                        />
                    </Svg>

                    {/* Center Text */}
                    <View style={styles.centerText}>
                        <Text style={styles.centerValue}>
                            {avgSleep.toFixed(1)}
                        </Text>
                        <Text style={styles.centerLabel}>Hours</Text>
                    </View>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statIcon}>🌙</Text>
                    <Text style={styles.statValue}>
                        {avgSleep.toFixed(1)} h
                    </Text>
                    <Text style={styles.statLabel}>Sleep</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statIcon}>💤</Text>
                    <Text style={styles.statValue}>{deepSleep.time}</Text>
                    <Text style={styles.statLabel}>Deep sleep</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statIcon}>⭐</Text>
                    <Text style={styles.statValue}>{sleepQuality}</Text>
                    <Text style={styles.statLabel}>Quality</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        selectedTab === "today" && styles.tabActive,
                    ]}
                    onPress={() => setSelectedTab("today")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            selectedTab === "today" && styles.tabTextActive,
                        ]}
                    >
                        Today
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        selectedTab === "weekly" && styles.tabActive,
                    ]}
                    onPress={() => setSelectedTab("weekly")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            selectedTab === "weekly" && styles.tabTextActive,
                        ]}
                    >
                        Weekly
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        selectedTab === "monthly" && styles.tabActive,
                    ]}
                    onPress={() => setSelectedTab("monthly")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            selectedTab === "monthly" && styles.tabTextActive,
                        ]}
                    >
                        Monthly
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Wave Chart */}
            <View style={styles.chartContainer}>
                <Svg height="140" width="100%">
                    <Path
                        d={generateWavePath(waveData)}
                        fill="none"
                        stroke="#00BCD4"
                        strokeWidth="3"
                    />
                    {waveData.map((value, index) => (
                        <Circle
                            key={index}
                            cx={(index + 0.5) * (100 / 7) + "%"}
                            cy={120 - (value / 10) * 100}
                            r="4"
                            fill="#00BCD4"
                        />
                    ))}
                </Svg>
                <View style={styles.dayLabels}>
                    {labels.map((day, i) => (
                        <Text key={i} style={styles.dayLabel}>
                            {day}
                        </Text>
                    ))}
                </View>
            </View>

            {/* Time Picker Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
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

// Hàm tạo đường sóng
const generateWavePath = (data: number[]) => {
    if (data.length === 0) return "";
    const width = 100;
    const height = 100;
    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (value / 10) * height;
        return `${i === 0 ? "M" : "L"} ${x}% ${y}`;
    });
    return points.join(" ") + " L 100% 100 L 0% 100 Z";
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },
    progressContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    progressText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 4,
    },
    progressPercent: {
        fontSize: 18,
        fontWeight: "700",
        color: "#00BCD4",
        marginBottom: 16,
    },
    circleWrapper: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    centerText: {
        position: "absolute",
        alignItems: "center",
    },
    centerValue: {
        fontSize: 36,
        fontWeight: "800",
        color: "#00BCD4",
    },
    centerLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 32,
    },
    statBox: {
        alignItems: "center",
    },
    statIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
    },
    statLabel: {
        fontSize: 12,
        color: "#999",
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#E0F7FA",
        borderRadius: 25,
        padding: 4,
        marginBottom: 24,
        alignSelf: "center",
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    tabActive: {
        backgroundColor: "#00BCD4",
    },
    tabText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    tabTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
    chartContainer: {
        height: 160,
        marginBottom: 40,
    },
    dayLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginTop: 8,
    },
    dayLabel: {
        fontSize: 12,
        color: "#999",
        width: 40,
        textAlign: "center",
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
