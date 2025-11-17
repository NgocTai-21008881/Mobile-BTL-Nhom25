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
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchDailyActivity } from "../services/activityService";
import {
    getSleepSchedule,
    updateSleepSchedule,
    calculateDeepSleep,
    evaluateSleepQuality,
    calculateScheduledSleep,
} from "../services/sleepService";
import { supabase } from "../lib/supabase";

interface SleepData {
    date: string;
    sleep_hours: number;
}

export default function SleepScreen() {
    const [sleepData, setSleepData] = useState<SleepData[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [bedtime, setBedtime] = useState<string>("22:00");
    const [wakeUpTime, setWakeUpTime] = useState<string>("07:00");
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTime, setEditingTime] = useState<"bedtime" | "wakeup" | null>(
        null
    );
    const [tempHour, setTempHour] = useState(0);
    const [tempMinute, setTempMinute] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user?.id) setUserId(data.user.id);
        })();
    }, []);

    useEffect(() => {
        if (!userId) return;
        loadData();
    }, [userId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load sleep data
            const data = await fetchDailyActivity(userId!, "week");
            if (data.length > 0) {
                setSleepData(data);
                const dayLabels = data.map((d: any) => {
                    const date = new Date(d.date);
                    const days = [
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                    ];
                    return days[date.getDay()] || "?";
                });
                setLabels(dayLabels);
            }

            // Load sleep schedule
            const schedule = await getSleepSchedule(userId!);
            setBedtime(schedule.bedtime);
            setWakeUpTime(schedule.wakeup_time);
        } catch (e) {
            console.error("Lỗi tải dữ liệu:", e);
        } finally {
            setLoading(false);
        }
    };

    const avgSleep = useMemo(() => {
        if (sleepData.length === 0) return "0";
        const total = sleepData.reduce(
            (sum, d) => sum + (d.sleep_hours || 0),
            0
        );
        return (total / sleepData.length).toFixed(1);
    }, [sleepData]);

    const sleepRate = useMemo(() => {
        const avg = parseFloat(avgSleep);
        return evaluateSleepQuality(avg);
    }, [avgSleep]);

    const deepSleepData = useMemo(() => {
        const avg = parseFloat(avgSleep);
        return calculateDeepSleep(avg);
    }, [avgSleep]);

    const scheduledSleep = useMemo(() => {
        return calculateScheduledSleep(bedtime, wakeUpTime);
    }, [bedtime, wakeUpTime]);

    const handleTimePress = (type: "bedtime" | "wakeup") => {
        const timeStr = type === "bedtime" ? bedtime : wakeUpTime;
        const [h, m] = timeStr.split(":").map(Number);
        setTempHour(h);
        setTempMinute(m);
        setEditingTime(type);
        setModalVisible(true);
    };

    const handleSaveTime = async () => {
        try {
            setIsSaving(true);
            const timeStr = `${String(tempHour).padStart(2, "0")}:${String(
                tempMinute
            ).padStart(2, "0")}`;

            if (editingTime === "bedtime") {
                setBedtime(timeStr);
            } else {
                setWakeUpTime(timeStr);
            }

            // Save to database
            const newBedtime = editingTime === "bedtime" ? timeStr : bedtime;
            const newWakeup = editingTime === "wakeup" ? timeStr : wakeUpTime;

            const { success } = await updateSleepSchedule(
                userId!,
                newBedtime,
                newWakeup
            );

            if (success) {
                setModalVisible(false);
                setEditingTime(null);
            } else {
                Alert.alert("Thất bại", "Không thể cập nhật lịch ngủ");
            }
        } catch (e) {
            console.error("Lỗi:", e);
            Alert.alert("Lỗi", "Có lỗi xảy ra");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <ActivityIndicator size="large" color="#00BCD4" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Simple Title */}
            <Text style={styles.title}>Sleep</Text>

            {/* Average Sleep Card */}
            <View style={styles.avgCard}>
                <Text style={styles.avgLabel}>
                    Your average time of sleep a day is
                </Text>
                <View style={styles.avgTimeContainer}>
                    <Text style={styles.avgTimeValue}>{avgSleep}</Text>
                    <Text style={styles.avgTimeSuffix}>h</Text>
                </View>
                {/* Calculate minutes from scheduled sleep */}
                <Text style={styles.avgTimeMinutes}>
                    {scheduledSleep.minutes.toString().padStart(2, "0")} min
                </Text>
            </View>

            {/* Range Selector */}
            <View style={styles.rangeSelector}>
                <TouchableOpacity style={styles.rangeBtnInactive}>
                    <Text style={styles.rangeBtnTextInactive}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rangeBtnActive}>
                    <Text style={styles.rangeBtnTextActive}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rangeBtnInactive}>
                    <Text style={styles.rangeBtnTextInactive}>Monthly</Text>
                </TouchableOpacity>
            </View>

            {/* Chart */}
            <View style={styles.chartCard}>
                <View style={styles.chartContainer}>
                    {sleepData.map((item, index) => (
                        <View key={index} style={styles.barWrap}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: Math.max(
                                            20,
                                            (item.sleep_hours / 10) * 120
                                        ),
                                    },
                                ]}
                            />
                            <Text style={styles.barLabel}>{labels[index]}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Sleep Stats - Two in a row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>😴</Text>
                    <Text style={styles.statLabel}>Sleep rate</Text>
                    <Text style={styles.statValue}>{sleepRate}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>😴</Text>
                    <Text style={styles.statLabel}>Deepsleep</Text>
                    <Text style={styles.statValue}>
                        {deepSleepData.time}
                    </Text>
                </View>
            </View>

            {/* Schedule Section */}
            <View style={styles.scheduleSection}>
                <View style={styles.scheduleHeader}>
                    <Text style={styles.scheduleTitle}>Set your schedule</Text>
                    <TouchableOpacity>
                        <Text style={styles.editBtn}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.timeButtonsContainer}>
                    <TouchableOpacity
                        style={styles.bedtimeBtn}
                        onPress={() => handleTimePress("bedtime")}
                    >
                        <MaterialCommunityIcons
                            name="sleep"
                            size={24}
                            color="#fff"
                        />
                        <View style={styles.btnTextContainer}>
                            <Text style={styles.btnSmallText}>Bedtime</Text>
                            <Text style={styles.btnLargeText}>{bedtime}</Text>
                        </View>
                        <Text style={styles.btnPeriod}>pm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.wakeupBtn}
                        onPress={() => handleTimePress("wakeup")}
                    >
                        <MaterialCommunityIcons
                            name="alarm"
                            size={24}
                            color="#fff"
                        />
                        <View style={styles.btnTextContainer}>
                            <Text style={styles.btnSmallText}>Wake up</Text>
                            <Text style={styles.btnLargeText}>
                                {wakeUpTime}
                            </Text>
                        </View>
                        <Text style={styles.btnPeriod}>am</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Time Picker Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
            >
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
                            {/* Hours Picker */}
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

                            {/* Minutes Picker */}
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
        backgroundColor: "#F5F7FA",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1F2937",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
    },

    // Main Card
    mainCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTop: {
        marginBottom: 16,
    },
    cardLabel: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
        marginBottom: 8,
    },
    cardValue: {
        fontSize: 48,
        fontWeight: "800",
        color: "#1F2937",
    },
    cardUnit: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    sleepRate: {
        fontSize: 16,
        fontWeight: "600",
        color: "#00BCD4",
        marginTop: 12,
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: "#E0F7FA",
        borderRadius: 20,
    },

    // Chart
    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 16,
    },
    chartContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 160,
    },
    barWrap: {
        alignItems: "center",
        flex: 1,
    },
    bar: {
        width: 28,
        backgroundColor: "#00BCD4",
        borderRadius: 6,
        marginBottom: 8,
    },
    barValue: {
        fontSize: 11,
        fontWeight: "600",
        color: "#00BCD4",
        marginBottom: 4,
    },
    barLabel: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "500",
    },

    // Stats Section
    statsSection: {
        gap: 12,
        marginBottom: 20,
    },
    statBox: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#FFE8E8",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    statIconBox2: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#FFF3E0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    statBoxLabel: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 4,
    },
    statBoxValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },

    // Schedule Section
    scheduleSection: {
        marginBottom: 20,
    },
    scheduleHeader: {
        marginBottom: 16,
    },
    scheduleTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },
    timeButtonsContainer: {
        gap: 12,
        marginBottom: 16,
    },
    timeButton1: {
        backgroundColor: "#EC4752",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    timeButton2: {
        backgroundColor: "#FF9800",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    timeButtonIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    timeButtonContent: {
        flex: 1,
    },
    timeButtonLabel: {
        fontSize: 12,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "500",
    },
    timeButtonValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        marginTop: 2,
    },
    scheduledSleepBox: {
        backgroundColor: "#00BCD4",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    scheduledLabel: {
        fontSize: 13,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 4,
    },
    scheduledValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
    },

    // Time Picker Modal
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
        color: "#1F2937",
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
        color: "#6B7280",
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
        color: "#1F2937",
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
        paddingVertical: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmBtnText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },

    // Recommendations
    recCard: {
        backgroundColor: "#E3F2FD",
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    recTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 12,
    },
    recText: {
        fontSize: 13,
        color: "#374151",
        lineHeight: 20,
        marginBottom: 8,
    },
});
