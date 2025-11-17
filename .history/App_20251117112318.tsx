import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type TabType = "Today" | "Weekly" | "Monthly";

export default function SleepScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("Weekly");
  const [bedtime, setBedtime] = useState("22:00 pm");
  const [wakeup, setWakeup] = useState("07:31 am");

  // Dữ liệu biểu đồ (7 ngày gần nhất)
  const weeklyData = [
    { day: "Mon", height: 0.6 },
    { day: "Tue", height: 0.5 },
    { day: "Web", height: 0.4 },
    { day: "Thu", height: 0.45 },
    { day: "Fri", height: 0.55 },
    { day: "Sat", height: 0.8 },
    { day: "Sun", height: 0.9 },
  ];

  const showTimePicker = (type: "bed" | "wake") => {
    Alert.alert(
      type === "bed" ? "Chọn giờ đi ngủ" : "Chọn giờ thức dậy",
      "Bạn muốn thay đổi thời gian?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () => {
            if (type === "bed") {
              setBedtime("22:00 pm");
            } else {
              setWakeup("07:31 am");
            }
            Alert.alert("Đã cập nhật!", `Giờ ${type === "bed" ? "ngủ" : "dậy"}: ${type === "bed" ? bedtime : wakeup}`);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sleep</Text>
      </View>

      {/* Average Sleep Time */}
      <View style={styles.avgContainer}>
        <Text style={styles.avgLabel}>Your average time of</Text>
        <Text style={styles.avgLabel}>sleep a day is</Text>
        <Text style={styles.avgTime}>7h 31</Text>
        <Text style={styles.avgMin}>min</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(["Today", "Weekly", "Monthly"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style=[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {weeklyData.map((item, index) => (
            <View key={index} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: item.height * 180,
                    backgroundColor:
                      item.day === "Sun" || item.day === "Sat"
                        ? "#4A90E2"
                        : "#A0D8F1",
                  },
                ]}
              />
              <Text style={styles.dayLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="moon" size={20} color="#4A90E2" />
          </View>
          <Text style={styles.statValue}>82%</Text>
          <Text style={styles.statLabel}>Sleep rate</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="bed" size={20} color="#4A90E2" />
          </View>
          <Text style={styles.statValue}>1h 3min</Text>
          <Text style={styles.statLabel}>Deep sleep</Text>
        </View>
      </View>

      {/* Schedule Section */}
      <View style={styles.scheduleSection}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>Set your schedule</Text>
          <TouchableOpacity>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeButtons}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePicker("bed")}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF8E8E"]}
              style={styles.gradientButton}
            >
              <Ionicons name="moon-outline" size={20} color="white" />
              <Text style={styles.timeText}>Bedtime</Text>
              <Text style={styles.timeValue}>{bedtime}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => showTimePicker("wake")}
          >
            <LinearGradient
              colors={["#FFB74D", "#FFD54F"]}
              style={styles.gradientButton}
            >
              <Ionicons name="sunny-outline" size={20} color="white" />
              <Text style={styles.timeText}>Wake up</Text>
              <Text style={styles.timeValue}>{wakeup}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  avgContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avgLabel: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  avgTime: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4A90E2",
    marginTop: 8,
  },
  avgMin: {
    fontSize: 24,
    color: "#4A90E2",
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#E8F0FE",
    marginHorizontal: 40,
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#4A90E2",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  activeTabText: {
    color: "white",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 200,
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 28,
    borderRadius: 14,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E6F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  scheduleSection: {
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    color: "#1A1A1A",
  },
  editText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "600",
  },
  timeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  gradientButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  timeText: {
    color: "white",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },
  timeValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
});