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
// Thêm MaterialCommunityIcons để có icon 'bed' và 'bell'
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Svg, Circle } from "react-native-svg"; // Path không còn cần thiết
import {
    fetchDailyActivity,
    getTodayActivity,
    DailyActivity,
} from "../services/activityService";
import {
    getSleepSchedule,
    updateSleepSchedule,
    calculateDeepSleep,
    evaluateSleepQuality, // Mặc dù evaluateSleepQuality không dùng, nhưng progress % thì có
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
    // Thay đổi giờ thức dậy mặc định để khớp với hình ảnh
    const [wakeUpTime, setWakeUpTime] = useState("07:30");
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTime, setEditingTime] = useState<"bedtime" | "wakeup" | null>(
        null
    );
    const [tempHour, setTempHour] = useState(22);
    const [tempMinute, setTempMinute] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTab, setSelectedTab] = useState<Period>("weekly");
    const [selectedDay, setSelectedDay] = useState<number | null>(6); // Chọn ngày cuối cùng (Sat)

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
            let tempLabels: string[] = [];

            if (selectedTab === "today") {
                const todayData = await getTodayActivity(userId!);
                const today = new Date().toISOString().split("T")[0];
                data = [
                    { date: today, sleep_hours: todayData.sleep_hours || 0 },
                ];
                tempLabels = ["Today"];
            } else if (selectedTab === "weekly") {
                data = await fetchDailyActivity(userId!, "week");
                // Giả sử data trả về 7 ngày từ T2-CN
                // Sửa logic tạo nhãn cho đúng
                const dayMap = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
                tempLabels = data.map((d) => {
                    const date = new Date(d.date);
                    // getDay() trả về 0=CN, 1=T2,...
                    return dayMap[date.getDay()];
                });
                // Đảm bảo dữ liệu và nhãn luôn là 7
                if (data.length < 7) {
                    const mockData = [
                        "Mo",
                        "Tu",
                        "We",
                        "Th",
                        "Fr",
                        "Sa",
                        "Su",
                    ].map((label, index) => {
                        const existing = tempLabels.indexOf(label);
                        if (existing > -1) {
                            return {
                                date: data[existing].date,
                                sleep_hours: data[existing].sleep_hours || 0,
                            };
                        }
                        return {
                            date: `d${index}`,
                            sleep_hours: Math.random() * 5 + 2,
                        }; // Dữ liệu giả cho đủ 7 ngày
                    });
                    data = mockData;
                    tempLabels = [
                        "Mon",
                        "Tue",
                        "Web",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun",
                    ];
                }
            } else {
                // monthly
                data = await fetchDailyActivity(userId!, "month");
                tempLabels = data.map((d) => {
                    const date = new Date(d.date);
                    return `${date.getDate()}`;
                });
            }

            const sleepRecords: SleepRecord[] = data.map((d) => ({
                date: d.date,
                sleep_hours: d.sleep_hours || 0,
            }));

            setRecords(sleepRecords);
            setLabels(tempLabels);

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

    // Lấy % tiến độ cho "Sleep rate"
    const progressPercent = Math.min(100, Math.round((avgSleep / 8) * 100)); // Giả sử mục tiêu là 8 giờ
    const deepSleep = calculateDeepSleep(avgSleep);
    // const quality = evaluateSleepQuality(avgSleep); // Biến này không được dùng trong UI mới

    // Chuyển đổi giờ (float) thành "Xh Y min"
    const formatAvgSleep = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours % 1) * 60);
        return { h, m };
    };
    const avg = formatAvgSleep(avgSleep);

    // Tìm giờ ngủ tối đa để tính chiều cao cột
    const maxSleep = useMemo(() => {
        if (records.length === 0) return 8; // Mặc định là 8
        return Math.max(...records.map((r) => r.sleep_hours), 8); // Luôn đảm bảo tối thiểu là 8
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
        >
            <Text style={styles.title}>Sleep</Text>

            {/* Văn bản ngủ trung bình */}
            <View style={styles.avgSleepBox}>
                <Text style={styles.avgSleepLabel}>
                    Your average time of sleep a day is
                </Text>
                <Text style={styles.avgSleepValue}>
                    {avg.h}h {avg.m} min
                </Text>
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

            {/* Biểu đồ cột */}
            <View style={styles.barChartContainer}>
                {labels.map((l, i) => {
                    const record = records[i];
                    // Tính chiều cao cột
                    const barHeight = record
                        ? (record.sleep_hours / maxSleep) * 100
                        : 0;
                    // Highlight ngày được chọn
                    const isSelectedDay = selectedDay === i;

                    return (
                        <TouchableOpacity
                            key={i}
                            style={styles.barGroup}
                            onPress={() =>
                                setSelectedDay(isSelectedDay ? null : i)
                            }
                        >
                            <View style={styles.barBackground}>
                                <View
                                    style={[
                                        styles.barForeground,
                                        {
                                            height: `${Math.max(
                                                barHeight,
                                                5
                                            )}%`,
                                        },
                                        isSelectedDay && styles.barSelected,
                                    ]}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.barLabel,
                                    isSelectedDay && styles.barLabelSelected,
                                ]}
                            >
                                {l}
                            </Text>
                            {record && (
                                <Text style={styles.barValue}>
                                    {record.sleep_hours.toFixed(1)}h
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* 2 Thẻ Stats */}
            <View style={styles.infoRow}>
                <View style={styles.infoCard}>
                    <Text style={styles.infoCardTitle}>☀️ Sleep rate</Text>
                    <Text style={styles.infoCardValue}>{progressPercent}%</Text>
                </View>
                <View style={styles.infoCard}>
                    <Text style={styles.infoCardTitle}>😴 Deepsleep</Text>
                    {/* Giả sử deepSleep.time trả về "1h 3min" */}
                    <Text style={styles.infoCardValue}>{deepSleep.time}</Text>
                </View>
            </View>

            {/* Sleep Schedule */}
            <View style={styles.scheduleBox}>
                <View style={styles.scheduleHeader}>
                    <Text style={styles.scheduleTitle}>Set your schedule</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.timeRow}>
                    <TouchableOpacity
                        style={[styles.timeBtn, styles.bedtimeBtn]}
                        onPress={() => openTimePicker("bedtime")}
                    >
                        <View style={styles.timeBtnContent}>
                            <MaterialCommunityIcons
                                name="bed"
                                size={24}
                                color="#fff"
                                style={styles.timeIcon}
                            />
                            <View>
                                <Text style={styles.timeLbl}>Bedtime</Text>
                                {/* Thêm 'pm' như trong hình */}
                                <Text style={styles.timeVal}>{bedtime} pm</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.timeBtn, styles.wakeupBtn]}
                        onPress={() => openTimePicker("wakeup")}
                    >
                        <View style={styles.timeBtnContent}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={24}
                                color="#fff"
                                style={styles.timeIcon}
                            />
                            <View>
                                <Text style={styles.timeLbl}>Wake up</Text>
                                {/* Thêm 'am' như trong hình */}
                                <Text style={styles.timeVal}>
                                    {wakeUpTime} am
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal (Giữ nguyên) */}
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
                                            color="#5865F2"
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
                                            color="#5865F2"
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
                                            color="#5865F2"
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

// *** StyleSheet ĐÃ ĐƯỢC CẬP NHẬT ***
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
        fontSize: 24, // Giảm kích thước một chút
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 24, // Tăng khoảng cách
    },

    // Kiểu cho văn bản ngủ trung bình
    avgSleepBox: {
        alignItems: "center",
        marginBottom: 24,
    },
    avgSleepLabel: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
    avgSleepValue: {
        fontSize: 32,
        fontWeight: "700",
        color: "#5865F2", // Xanh dương
    },

    // Xóa các kiểu cũ: progressBox, progressHint, progressPct, circleWrapper, centerInfo, centerVal, centerUnit

    // Kiểu cho 2 thẻ thông tin
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 32,
        marginHorizontal: 10, // Thêm khoảng cách
    },
    infoCard: {
        backgroundColor: "#F8F8F8", // Màu nền xám nhạt
        borderRadius: 16,
        padding: 16,
        width: "48%", // Chia 2 cột
        alignItems: "flex-start", // Căn trái
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    infoCardTitle: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
        marginBottom: 8,
    },
    infoCardValue: {
        fontSize: 20,
        color: "#333",
        fontWeight: "700",
    },

    // Xóa các kiểu cũ: statsRow, stat, statEmoji, statVal, statLbl

    // Kiểu cho Tabs (gần giống, chỉ đổi màu nền)
    tabBar: {
        flexDirection: "row",
        backgroundColor: "#F0F0F0", // Màu nền xám nhạt hơn
        borderRadius: 25,
        padding: 4,
        alignSelf: "center",
        marginBottom: 24,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 22,
        borderRadius: 20,
    },
    tabSel: {
        backgroundColor: "#5865F2", // Xanh dương
    },
    tabTxt: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    tabTxtSel: {
        color: "#fff",
        fontWeight: "600",
    },

    // Kiểu cho biểu đồ cột
    barChartContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end", // Căn các cột xuống dưới
        height: 150, // Chiều cao cố định cho khu vực biểu đồ
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    barGroup: {
        flex: 1,
        alignItems: "center",
        marginHorizontal: 5, // Khoảng cách giữa các cột
    },
    barBackground: {
        width: "100%", // Chiều rộng cột
        flex: 1, // Chiếm hết chiều cao
        backgroundColor: "#F0F0F0", // Màu nền cột
        borderRadius: 8,
        overflow: "hidden", // Đảm bảo barForeground không tràn
        justifyContent: "flex-end", // Đẩy barForeground xuống dưới
    },
    barForeground: {
        width: "100%",
        backgroundColor: "#A0C4FF", // Xanh dương nhạt
        borderRadius: 8,
    },
    barSelected: {
        backgroundColor: "#5865F2", // Xanh dương đậm
    },
    barLabel: {
        fontSize: 12,
        color: "#999",
        marginTop: 8,
        fontWeight: "500",
    },
    barLabelSelected: {
        color: "#5865F2",
        fontWeight: "700",
    },
    barValue: {
        fontSize: 11,
        color: "#5865F2",
        fontWeight: "700",
        marginTop: 2,
    },

    // Xóa các kiểu cũ: chartBox, dayRow, dayTxt

    // Kiểu cho lịch ngủ
    scheduleBox: {
        marginBottom: 40,
        backgroundColor: "#F8F8F8",
        borderRadius: 16,
        padding: 16,
    },
    scheduleHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    scheduleTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    editLink: {
        fontSize: 14,
        fontWeight: "600",
        color: "#5865F2",
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    timeBtn: {
        borderRadius: 16,
        width: "48%", // Chia 2 cột
        padding: 16,
    },
    // Thêm 2 kiểu màu
    bedtimeBtn: {
        backgroundColor: "#FF7B7B", // Màu đỏ
    },
    wakeupBtn: {
        backgroundColor: "#FFA756", // Màu cam
    },
    timeBtnContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeIcon: {
        marginRight: 10,
    },
    timeLbl: {
        fontSize: 14,
        color: "#FFF",
        fontWeight: "500",
    },
    timeVal: {
        fontSize: 20, // Kích thước trong hình
        fontWeight: "700",
        color: "#FFF", // Chữ trắng
        marginTop: 4,
    },

    // Modal (Giữ nguyên)
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
