// SleepScreen.tsx
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

type Period = "today" | "weekly" | "monthly";

interface SleepData {
  date: string;
  sleep_hours: number;
}

// MOCK DATA (dữ liệu giả để test)
const generateMockData = (period: Period): SleepData[] => {
  const now = new Date();
  const data: SleepData[] = [];

  if (period === "today") {
    return [{ date: now.toISOString().split("T")[0], sleep_hours: 7.5 }];
  }

  const days = period === "weekly" ? 7 : 30;
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - 1 - i));
    data.push({
      date: date.toISOString().split("T")[0],
      sleep_hours: Math.max(5, Math.min(10, 6 + Math.random() * 3 + Math.sin(i / 3))),
    });
  }
  return data;
};

// Giả lập service (thay thế fetchDailyActivity)
const fetchDailyActivity = async (userId: string, period: Period): Promise<SleepData[]> => {
  await new Promise((r) => setTimeout(r, 500)); // Giả lập network
  return generateMockData(period);
};

const getSleepSchedule = async (userId: string) => {
  return { bedtime: "22:00", wakeup_time: "07:00" };
};

const updateSleepSchedule = async (userId: string, bedtime: string, wakeup: string) => {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
};

const calculateDeepSleep = (avg: number) => {
  const deep = avg * 0.25;
  return { time: `${deep.toFixed(1)}h` };
};

const evaluateSleepQuality = (avg: number): string => {
  if (avg >= 8) return "Excellent";
  if (avg >= 7) return "Good";
  if (avg >= 6) return "Fair";
  return "Poor";
};

export default function SleepScreen() {
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bedtime, setBedtime] = useState("22:00");
  const [wakeUpTime, setWakeUpTime] = useState("07:00");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTime, setEditingTime] = useState<"bedtime" | "wakeup" | null>(null);
  const [tempHour, setTempHour] = useState(22);
  const [tempMinute, setTempMinute] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Period>("weekly");

  // Load dữ liệu khi đổi tab
  useEffect(() => {
    loadData();
  }, [selectedTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDailyActivity("mock_user", selectedTab);
      setSleepData(data);

      const dayLabels = data.map((d) => {
        const date = new Date(d.date);
        const day = date.getDate();
        return selectedTab === "monthly" ? `${day}` : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][date.getDay()];
      });
      setLabels(dayLabels);
    } catch (e) {
      Alert.alert("Lỗi", "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Tính trung bình
  const avgSleep = useMemo(() => {
    if (sleepData.length === 0) return 0;
    const total = sleepData.reduce((sum, d) => sum + d.sleep_hours, 0);
    return total / sleepData.length;
  }, [sleepData]);

  const progress = Math.min(100, (avgSleep / 8) * 100);
  const deepSleep = calculateDeepSleep(avgSleep);
  const sleepQuality = evaluateSleepQuality(avgSleep);

  // Tạo sóng
  const wavePath = useMemo(() => {
    if (sleepData.length === 0) return "";
    const maxH = Math.max(...sleepData.map((d) => d.sleep_hours));
    const points = sleepData.map((d, i) => {
      const x = (i / (sleepData.length - 1)) * 100;
      const y = 80 - (d.sleep_hours / maxH) * 60;
      return `${i === 0 ? "M" : "L"} ${x}% ${y}`;
    });
    return points.join(" ") + " L 100% 100 L 0% 100 Z";
  }, [sleepData]);

  const handleTimePress = (type: "bedtime" | "wakeup") => {
    const [h, m] = (type === "bedtime" ? bedtime : wakeUpTime).split(":").map(Number);
    setTempHour(h);
    setTempMinute(m);
    setEditingTime(type);
    setModalVisible(true);
  };

  const handleSaveTime = async () => {
    setIsSaving(true);
    const timeStr = `${String(tempHour).padStart(2, "0")}:${String(tempMinute).padStart(2, "0")}`;
    try {
      const { success } = await updateSleepSchedule("mock_user", bedtime, wakeUpTime);
      if (success) {
        if (editingTime === "bedtime") setBedtime(timeStr);
        else setWakeUpTime(timeStr);
        setModalVisible(false);
        setEditingTime(null);
      }
    } catch {
      Alert.alert("Lỗi", "Không lưu được");
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Sleep</Text>

      {/* Progress Circle */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>You have achieved</Text>
        <Text style={styles.progressPercent}>{Math.round(progress)}% of your goal today</Text>

        <View style={styles.circleWrapper}>
          <Svg width={220} height={220} viewBox="0 0 220 220">
            <Circle cx="110" cy="110" r="100" stroke="#E0F7FA" strokeWidth="16" fill="none" />
            <Circle
              cx="110"
              cy="110"
              r="100"
              stroke="#00BCD4"
              strokeWidth="16"
              fill="none"
              strokeDasharray={2 * Math.PI * 100}
              strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
              strokeLinecap="round"
              transform="rotate(-90 110 110)"
            />
          </Svg>
          <View style={styles.centerText}>
            <Text style={styles.centerValue}>{avgSleep.toFixed(1)}</Text>
            <Text style={styles.centerLabel}>Hours</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>Moon</Text>
          <Text style={styles.statValue}>{avgSleep.toFixed(1)} h</Text>
          <Text style={styles.statLabel}>Sleep</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>Deep Sleep</Text>
          <Text style={styles.statValue}>{deepSleep.time}</Text>
          <Text style={styles.statLabel}>Deep sleep</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>Star</Text>
          <Text style={styles.statValue}>{sleepQuality}</Text>
          <Text style={styles.statLabel}>Quality</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(["today", "weekly", "monthly"] as Period[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Wave Chart */}
      <View style={styles.chartContainer}>
        <Svg height="140" width="100%">
          <Path d={wavePath} fill="#B3E5FC" opacity={0.5} />
          <Path d={wavePath.replace(/Z.*$/, "")} fill="none" stroke="#00BCD4" strokeWidth="3" />
          {sleepData.map((d, i) => (
            <Circle
              key={i}
              cx={`${(i / (sleepData.length - 1)) * 100}%`}
              cy={80 - (d.sleep_hours / Math.max(...sleepData.map((x) => x.sleep_hours))) * 60}
              r="4"
              fill="#00BCD4"
            />
          ))}
        </Svg>
        <View style={styles.dayLabels}>
          {labels.map((label, i) => (
            <Text key={i} style={styles.dayLabel}>{label}</Text>
          ))}
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.scheduleSection}>
        <Text style={styles.scheduleTitle}>Sleep Schedule</Text>
        <View style={styles.timeRow}>
          <TouchableOpacity style={styles.timeBtn} onPress={() => handleTimePress("bedtime")}>
            <Text style={styles.timeLabel}>Bedtime</Text>
            <Text style={styles.timeValue}>{bedtime}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timeBtn} onPress={() => handleTimePress("wakeup")}>
            <Text style={styles.timeLabel}>Wake up</Text>
            <Text style={styles.timeValue}>{wakeUpTime}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingTime === "bedtime" ? "Set Bedtime" : "Set Wake Up Time"}
              </Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.timePicker}>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Hour</Text>
                <View style={styles.timePickerBox}>
                  <TouchableOpacity
                    style={styles.timePickerBtn}
                    onPress={() => setTempHour(tempHour === 0 ? 23 : tempHour - 1)}
                  >
                    <AntDesign name="minus" size={28} color="#00BCD4" />
                  </TouchableOpacity>
                  <Text style={styles.timePickerValue}>{String(tempHour).padStart(2, "0")}</Text>
                  <TouchableOpacity
                    style={styles.timePickerBtn}
                    onPress={() => setTempHour(tempHour === 23 ? 0 : tempHour + 1)}
                  >
                    <AntDesign name="plus" size={28} color="#00BCD4" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.separator}>:</Text>

              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Minute</Text>
                <View style={styles.timePickerBox}>
                  <TouchableOpacity
                    style={styles.timePickerBtn}
                    onPress={() => setTempMinute(tempMinute === 0 ? 59 : tempMinute - 1)}
                  >
                    <AntDesign name="minus" size={28} color="#00BCD4" />
                  </TouchableOpacity>
                  <Text style={styles.timePickerValue}>{String(tempMinute).padStart(2, "0")}</Text>
                  <TouchableOpacity
                    style={styles.timePickerBtn}
                    onPress={() => setTempMinute(tempMinute === 59 ? 0 : tempMinute + 1)}
                  >
                    <AntDesign name="plus" size={28} color="#00BCD4" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveTime} disabled={isSaving}>
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 12 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "600", color: "#333", textAlign: "center", marginBottom: 20 },
  progressContainer: { alignItems: "center", marginBottom: 32 },
  progressText: { fontSize: 16, color: "#666" },
  progressPercent: { fontSize: 18, fontWeight: "700", color: "#00BCD4", marginVertical: 8 },
  circleWrapper: { position: "relative" },
  centerText: { position: "absolute", top: 70, left: 0, right: 0, alignItems: "center" },
  centerValue: { fontSize: 36, fontWeight: "800", color: "#00BCD4" },
  centerLabel: { fontSize: 14, color: "#666" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 32 },
  statBox: { alignItems: "center" },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: "700", color: "#333" },
  statLabel: { fontSize: 12, color: "#999" },
  tabContainer: { flexDirection: "row", backgroundColor: "#E0F7FA", borderRadius: 25, padding: 4, alignSelf: "center", marginBottom: 24 },
  tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  tabActive: { backgroundColor: "#00BCD4" },
  tabText: { fontSize: 14, color: "#666", fontWeight: "500" },
  tabTextActive: { color: "#fff", fontWeight: "600" },
  chartContainer: { height: 160, marginBottom: 40 },
  dayLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, marginTop: 8 },
  dayLabel: { fontSize: 12, color: "#999", width: 40, textAlign: "center" },
  scheduleSection: { marginBottom: 40 },
  scheduleTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 16, textAlign: "center" },
  timeRow: { flexDirection: "row", justifyContent: "space-around" },
  timeBtn: { alignItems: "center", padding: 16, backgroundColor: "#f8f8f8", borderRadius: 16, width: "44%" },
  timeLabel: { fontSize: 14, color: "#666" },
  timeValue: { fontSize: 24, fontWeight: "700", color: "#00BCD4", marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  timePicker: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 32 },
  timePickerColumn: { alignItems: "center" },
  timePickerLabel: { fontSize: 12, color: "#999", marginBottom: 12 },
  timePickerBox: { alignItems: "center" },
  timePickerBtn: { padding: 12 },
  timePickerValue: { fontSize: