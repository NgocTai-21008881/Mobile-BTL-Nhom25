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
            <Text style={styles.title}>Sleep</Text>

            {/* Average Sleep Time Card */}
            <View style={styles.averageCard}>
                <Text style={styles.averageLabel}>
                    Your average time of sleep a day is
                </Text>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeValue}>{avgSleep}</Text>
                    <Text style={styles.timeUnit}>h</Text>
                </View>
                <Text style={styles.timeValue2}>{calculateScheduleSleep}</Text>
            </View>

            {/* Range Selector */}
            <View style={styles.rangeSelector}>
                {(["Today", "Weekly", "Monthly"] as const).map((label) => (
                    <TouchableOpacity
                        key={label}
                        style={[
                            styles.rangeBtn,
                            label === "Weekly" && styles.rangeBtnActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.rangeBtnText,
                                label === "Weekly" && styles.rangeBtnTextActive,
                            ]}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bar Chart */}
            <View style={styles.chartCard}>
                <View style={styles.chartContainer}>
                    {sleepData.map((item, index) => (
                        <View key={index} style={styles.barWrapper}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: Math.max(
                                            10,
                                            (item.sleep_hours / 10) * 140
                                        ),
                                    },
                                ]}
                            />
                            <Text style={styles.barLabel}>{labels[index]}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Sleep Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <MaterialCommunityIcons
                            name="sleeping"
                            size={24}
                            color="#00BCD4"
                        />
                        <Text style={styles.statTitle}>Sleep rate</Text>
                    </View>
                    <Text style={styles.statValue}>{sleepRate}</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <MaterialCommunityIcons
                            name="moon-stars"
                            size={24}
                            color="#FF9800"
                        />
                        <Text style={styles.statTitle}>Deepsleep</Text>
                    </View>
                    <Text style={styles.statValue}>
                        {calculateDeepSleep.time}
                    </Text>
                </View>
            </View>

            {/* Schedule Section */}
            <View style={styles.scheduleSection}>
                <View style={styles.scheduleHeader}>
                    <Text style={styles.scheduleTitle}>Set your schedule</Text>
                    <TouchableOpacity onPress={() => {}}>
                        <Text style={styles.scheduleEdit}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.timeButtonsContainer}>
                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => handleTimePress("bedtime")}
                    >
                        <MaterialCommunityIcons
                            name="bed-time"
                            size={28}
                            color="#fff"
                        />
                        <Text style={styles.timeButtonLabel}>Bedtime</Text>
                        <Text style={styles.timeButtonValue}>{bedtime}</Text>
                        <Text style={styles.timeButtonSuffix}>pm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.timeButton2}
                        onPress={() => handleTimePress("wakeup")}
                    >
                        <MaterialCommunityIcons
                            name="alarm"
                            size={28}
                            color="#fff"
                        />
                        <Text style={styles.timeButtonLabel}>Wake up</Text>
                        <Text style={styles.timeButtonValue}>{wakeUpTime}</Text>
                        <Text style={styles.timeButtonSuffix}>am</Text>
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
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {editingTime === "bedtime"
                                    ? "Set Bedtime"
                                    : "Set Wake Up Time"}
                            </Text>
                            <View style={{ width: 30 }} />
                        </View>

                        <View style={styles.timePicker}>
                            <View style={styles.timeInputContainer}>
                                <Text style={styles.timeInputLabel}>Hour</Text>
                                <View style={styles.timeInputBox}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const [h, m] = (
                                                editingTime === "bedtime"
                                                    ? bedtime
                                                    : wakeUpTime
                                            )
                                                .split(":")
                                                .map(Number);
                                            handleTimeChange(
                                                h === 0 ? 23 : h - 1,
                                                m
                                            );
                                        }}
                                    >
                                        <AntDesign
                                            name="minus"
                                            size={24}
                                            color="#00BCD4"
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.timeInputValue}>
                                        {String(
                                            (editingTime === "bedtime"
                                                ? bedtime
                                                : wakeUpTime
                                            ).split(":")[0]
                                        ).padStart(2, "0")}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const [h, m] = (
                                                editingTime === "bedtime"
                                                    ? bedtime
                                                    : wakeUpTime
                                            )
                                                .split(":")
                                                .map(Number);
                                            handleTimeChange(
                                                h === 23 ? 0 : h + 1,
                                                m
                                            );
                                        }}
                                    >
                                        <AntDesign
                                            name="plus"
                                            size={24}
                                            color="#00BCD4"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.separator}>:</View>

                            <View style={styles.timeInputContainer}>
                                <Text style={styles.timeInputLabel}>
                                    Minute
                                </Text>
                                <View style={styles.timeInputBox}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const [h, m] = (
                                                editingTime === "bedtime"
                                                    ? bedtime
                                                    : wakeUpTime
                                            )
                                                .split(":")
                                                .map(Number);
                                            handleTimeChange(
                                                h,
                                                m === 0 ? 59 : m - 1
                                            );
                                        }}
                                    >
                                        <AntDesign
                                            name="minus"
                                            size={24}
                                            color="#00BCD4"
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.timeInputValue}>
                                        {String(
                                            (editingTime === "bedtime"
                                                ? bedtime
                                                : wakeUpTime
                                            ).split(":")[1]
                                        ).padStart(2, "0")}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const [h, m] = (
                                                editingTime === "bedtime"
                                                    ? bedtime
                                                    : wakeUpTime
                                            )
                                                .split(":")
                                                .map(Number);
                                            handleTimeChange(
                                                h,
                                                m === 59 ? 0 : m + 1
                                            );
                                        }}
                                    >
                                        <AntDesign
                                            name="plus"
                                            size={24}
                                            color="#00BCD4"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.confirmBtnText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Chart */}
            <View style={styles.chartCard}>
                <View style={styles.chartArea}>
                    {sleepData.map((v, i) => (
                        <View key={i} style={styles.barWrap}>
                            <View
                                style={[
                                    styles.bar,
                                    { height: Math.max(20, (v / 10) * 120) },
                                ]}
                            />
                            <Text style={styles.barLabel}>{labels[i]}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Recommendations */}
            <View style={styles.recCard}>
                <Text style={styles.recTitle}>Khuyến nghị</Text>
                <Text style={styles.recText}>• Nên ngủ 7-9 giờ mỗi đêm</Text>
                <Text style={styles.recText}>
                    • Đi ngủ lúc cố định mỗi ngày
                </Text>
                <Text style={styles.recText}>
                    • Tránh điện thoại trước khi ngủ
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 4,
    },
    headerSubtitle: { fontSize: 14, color: "#64748B", marginBottom: 20 },
    sleepCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 30,
        borderWidth: 2,
        borderColor: "#9B59B6",
        alignItems: "center",
        marginBottom: 20,
    },
    sleepIcon: { fontSize: 50, marginBottom: 10 },
    cardValue: {
        fontSize: 48,
        fontWeight: "800",
        color: "#0F172A",
    },
    cardUnit: { fontSize: 14, color: "#64748B", fontWeight: "600" },
    quality: { fontSize: 16, fontWeight: "700", marginTop: 10 },
    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    chartArea: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 140,
    },
    barWrap: { alignItems: "center" },
    bar: { width: 18, backgroundColor: "#9B59B6", borderRadius: 4 },
    barLabel: { fontSize: 11, color: "#64748B", marginTop: 8 },
    recCard: { backgroundColor: "#F3E8FF", borderRadius: 16, padding: 16 },
    recTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 12,
    },
    recText: {
        fontSize: 13,
        color: "#374151",
        lineHeight: 20,
        marginBottom: 8,
    },
});
