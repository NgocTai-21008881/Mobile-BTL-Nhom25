// screens/SleepScreen.tsx
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
import { AntDesign } from "@expo/vector-icons";
import { Svg, Circle, Path } from "react-native-svg";
import {
    fetchDailyActivity,
    getTodayActivity,
    DailyActivity,
} from "../services/activityService";
import {
    getSleepSchedule,
    updateSleepSchedule,
    calculateDeepSleep,
    evaluateSleepQuality,
} from "../services/sleepService";
import { supabase } from "../lib/supabase";

type Period = "today" | "weekly" | "monthly";

interface SleepRecord {
    date: string;
    sleep_hours: number;
}

export default function SleepScreen() {
    const [records, setRecords] = useState<SleepRecord[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [bedtime, setBedtime] = useState("22:00");
    const [wakeUpTime, setWakeUpTime] = useState("07:00");
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTime, setEditingTime] = useState<"bedtime" | "wakeup" | null>(
        null
    );
    const [tempHour, setTempHour] = useState(22);
    const [tempMinute, setTempMinute] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTab, setSelectedTab] = useState<Period>("weekly");

    // Lấy userId
    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user?.id) setUserId(data.user.id);
        })();
    }, []);

    // Load dữ liệu khi userId hoặc tab thay đổi
    useEffect(() => {
        if (!userId) return;
        loadData();
    }, [userId, selectedTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            let data: DailyActivity[] = [];

            if (selectedTab === "today") {
                const todayData = await getTodayActivity(userId!);
                const today = new Date().toISOString().split("T")[0];
                data = [
                    { date: today, sleep_hours: todayData.sleep_hours || 0 },
                ];
            } else {
                const rangeMap: Record<
                    Exclude<Period, "today">,
                    "week" | "month"
                > = {
                    weekly: "week",
                    monthly: "month",
                };
                data = await fetchDailyActivity(userId!, rangeMap[selectedTab]);
            }

            const sleepRecords: SleepRecord[] = data.map((d) => ({
                date: d.date,
                sleep_hours: d.sleep_hours || 0,
            }));
            setRecords(sleepRecords);

            // Tạo nhãn ngày
            const dayLabels = sleepRecords.map((r) => {
                const date = new Date(r.date);
                if (selectedTab === "monthly") return `${date.getDate()}`;
                return ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][
                    date.getDay()
                ];
            });
            setLabels(dayLabels);

            // Lấy lịch ngủ
            const schedule = await getSleepSchedule(userId!);
            setBedtime(schedule.bedtime);
            setWakeUpTime(schedule.wakeup_time);
        } catch (e) {
            console.error(e);
            Alert.alert("Lỗi", "Không tải được dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    // Tính toán
    const avgSleep = useMemo(() => {
        if (records.length === 0) return 0;
        return records.reduce((s, r) => s + r.sleep_hours, 0) / records.length;
    }, [records]);

    const progress = Math.min(100, (avgSleep / 8) * 100);
    const deepSleep = calculateDeepSleep(avgSleep);
    const quality = evaluateSleepQuality(avgSleep);

    // Biểu đồ sóng
    const wavePath = useMemo(() => {
        if (records.length === 0) return "";
        const max = Math.max(...records.map((r) => r.sleep_hours), 8);
        const points = records.map((r, i) => {
            const x = (i / (records.length - 1)) * 100;
            const y = 80 - (r.sleep_hours / max) * 65;
            return `${i === 0 ? "M" : "L"} ${x}% ${y}`;
        });
        return points.join(" ") + " L 100% 100 L 0% 100 Z";
    }, [records]);

    // Modal chỉnh giờ
    const openTimePicker = (type: "bedtime" | "wakeup") => {
        const [h, m] = (type === "bedtime" ? bedtime : wakeUpTime)
            .split(":")
            .map(Number);
        setTempHour(h);
        setTempMinute(m);
        setEditingTime(type);
        setModalVisible(true);
    };

    const saveTime = async () => {
        setIsSaving(true);
        const timeStr = `${String(tempHour).padStart(2, "0")}:${String(
            tempMinute
        ).padStart(2, "0")}`;
        try {
            const newBed = editingTime === "bedtime" ? timeStr : bedtime;
            const newWake = editingTime === "wakeup" ? timeStr : wakeUpTime;
            const { success } = await updateSleepSchedule(
                userId!,
                newBed,
                newWake
            );
            if (success) {
                if (editingTime === "bedtime") setBedtime(timeStr);
                else setWakeUpTime(timeStr);
                setModalVisible(false);
                setEditingTime(null);
            } else {
                Alert.alert("Lỗi", "Không lưu được lịch ngủ");
            }
        } catch {
            Alert.alert("Lỗi", "Có lỗi xảy ra");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
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

            {/* Progress Circle */}
            <View style={styles.progressBox}>
                <Text style={styles.progressHint}>You have achieved</Text>
                <Text style={styles.progressPct}>
                    {Math.round(progress)}% of your goal today
                </Text>

                <View style={styles.circleWrapper}>
                    <Svg width={220} height={220} viewBox="0 0 220 220">
                        <Circle
                            cx="110"
                            cy="110"
                            r="100"
                            stroke="#E0F7FA"
                            strokeWidth="16"
                            fill="none"
                        />
                        <Circle
                            cx="110"
                            cy="110"
                            r="100"
                            stroke="#00BCD4"
                            strokeWidth="16"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 100}
                            strokeDashoffset={
                                2 * Math.PI * 100 * (1 - progress / 100)
                            }
                            strokeLinecap="round"
                            transform="rotate(-90 110 110)"
                        />
                    </Svg>

                    <View style={styles.centerInfo}>
                        <Text style={styles.centerVal}>
                            {avgSleep.toFixed(1)}
                        </Text>
                        <Text style={styles.centerUnit}>Hours</Text>
                    </View>
                </View>
            </View>

            {/* 3 Stats */}
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statEmoji}>Moon</Text>
                    <Text style={styles.statVal}>{avgSleep.toFixed(1)} h</Text>
                    <Text style={styles.statLbl}>Sleep</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statEmoji}>Deep Sleep</Text>
                    <Text style={styles.statVal}>{deepSleep.time}</Text>
                    <Text style={styles.statLbl}>Deep sleep</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statEmoji}>Star</Text>
                    <Text style={styles.statVal}>{quality}</Text>
                    <Text style={styles.statLbl}>Quality</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                {(["today", "weekly", "monthly"] as Period[]).map((t) => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.tab, selectedTab === t && styles.tabSel]}
                        onPress={() => setSelectedTab(t)}
                    >
                        <Text
                            style={[
                                styles.tabTxt,
                                selectedTab === t && styles.tabTxtSel,
                            ]}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Wave Chart */}
            <View style={styles.chartBox}>
                <Svg height="140" width="100%">
                    <Path d={wavePath} fill="#B3E5FC" opacity={0.4} />
                    <Path
                        d={wavePath.replace(/Z.*$/, "")}
                        fill="none"
                        stroke="#00BCD4"
                        strokeWidth="3"
                    />
                    {records.map((r, i) => {
                        const max = Math.max(
                            ...records.map((x) => x.sleep_hours),
                            8
                        );
                        const y = 80 - (r.sleep_hours / max) * 65;
                        const x = (i / (records.length - 1)) * 100;
                        return (
                            <Circle
                                key={i}
                                cx={`${x}%`}
                                cy={y}
                                r="4"
                                fill="#00BCD4"
                            />
                        );
                    })}
                </Svg>

                <View style={styles.dayRow}>
                    {labels.map((l, i) => (
                        <Text key={i} style={styles.dayTxt}>
                            {l}
                        </Text>
                    ))}
                </View>
            </View>

            {/* Sleep Schedule */}
            <View style={styles.scheduleBox}>
                <Text style={styles.scheduleTitle}>Sleep Schedule</Text>
                <View style={styles.timeRow}>
                    <TouchableOpacity
                        style={styles.timeBtn}
                        onPress={() => openTimePicker("bedtime")}
                    >
                        <Text style={styles.timeLbl}>Bedtime</Text>
                        <Text style={styles.timeVal}>{bedtime}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.timeBtn}
                        onPress={() => openTimePicker("wakeup")}
                    >
                        <Text style={styles.timeLbl}>Wake up</Text>
                        <Text style={styles.timeVal}>{wakeUpTime}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modal}>
                        <View style={styles.modalHead}>
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

                        <View style={styles.pickerRow}>
                            <View style={styles.pickerCol}>
                                <Text style={styles.pickerLbl}>Hour</Text>
                                <View style={styles.pickerBox}>
                                    <TouchableOpacity
                                        style={styles.pickerBtn}
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
                                    <Text style={styles.pickerVal}>
                                        {String(tempHour).padStart(2, "0")}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.pickerBtn}
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

                            <Text style={styles.colon}>:</Text>

                            <View style={styles.pickerCol}>
                                <Text style={styles.pickerLbl}>Minute</Text>
                                <View style={styles.pickerBox}>
                                    <TouchableOpacity
                                        style={styles.pickerBtn}
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
                                    <Text style={styles.pickerVal}>
                                        {String(tempMinute).padStart(2, "0")}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.pickerBtn}
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
                            style={styles.confirmBtn}
                            onPress={saveTime}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmTxt}>Confirm</Text>
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
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },

    progressBox: { alignItems: "center", marginBottom: 32 },
    progressHint: { fontSize: 16, color: "#666" },
    progressPct: {
        fontSize: 18,
        fontWeight: "700",
        color: "#00BCD4",
        marginVertical: 8,
    },
    circleWrapper: { position: "relative" },
    centerInfo: {
        position: "absolute",
        top: 70,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    centerVal: { fontSize: 36, fontWeight: "800", color: "#00BCD4" },
    centerUnit: { fontSize: 14, color: "#666" },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 32,
    },
    stat: { alignItems: "center" },
    statEmoji: { fontSize: 28, marginBottom: 8 },
    statVal: { fontSize: 18, fontWeight: "700", color: "#333" },
    statLbl: { fontSize: 12, color: "#999" },

    tabBar: {
        flexDirection: "row",
        backgroundColor: "#E0F7FA",
        borderRadius: 25,
        padding: 4,
        alignSelf: "center",
        marginBottom: 24,
    },
    tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
    tabSel: { backgroundColor: "#00BCD4" },
    tabTxt: { fontSize: 14, color: "#666", fontWeight: "500" },
    tabTxtSel: { color: "#fff", fontWeight: "600" },

    chartBox: { height: 160, marginBottom: 40 },
    dayRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginTop: 8,
    },
    dayTxt: { fontSize: 12, color: "#999", width: 40, textAlign: "center" },

    scheduleBox: { marginBottom: 40 },
    scheduleTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 16,
    },
    timeRow: { flexDirection: "row", justifyContent: "space-around" },
    timeBtn: {
        alignItems: "center",
        padding: 16,
        backgroundColor: "#f8f8f8",
        borderRadius: 16,
        width: "44%",
    },
    timeLbl: { fontSize: 14, color: "#666" },
    timeVal: {
        fontSize: 24,
        fontWeight: "700",
        color: "#00BCD4",
        marginTop: 4,
    },

    modalBg: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modal: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    modalHead: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
    pickerRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
    },
    pickerCol: { alignItems: "center" },
    pickerLbl: { fontSize: 12, color: "#999", marginBottom: 12 },
    pickerBox: { alignItems: "center" },
    pickerBtn: { padding: 12 },
    pickerVal: {
        fontSize: 44,
        fontWeight: "800",
        color: "#333",
        width: 60,
        textAlign: "center",
    },
    colon: {
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
    confirmTxt: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
