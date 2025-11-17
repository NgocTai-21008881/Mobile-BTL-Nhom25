import React, { useState, useMemo, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { fetchDailyActivity, RangeKey } from "../services/activityService";
import { supabase } from "../lib/supabase";

const screenWidth = Dimensions.get("window").width;

type RangeType = "week" | "month" | "quarter";

interface ActivityData {
    date: string;
    steps: number;
    calories: number;
    heart_rate: number;
    sleep_hours: number;
}

export default function StepScreen() {
    const [selectedRange, setSelectedRange] = useState<RangeType>("week");
    const [userId, setUserId] = useState<string | null>(null);
    const [activities, setActivities] = useState<ActivityData[]>([]);
    const [loading, setLoading] = useState(false);

    // Constants
    const GOAL_PER_DAY = 18000;
    const GOAL_MAP = {
        week: GOAL_PER_DAY * 7,
        month: GOAL_PER_DAY * 30,
        quarter: GOAL_PER_DAY * 90,
    };

    // Lấy user ID
    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user?.id) {
                setUserId(data.user.id);
            }
        })();
    }, []);

    // Lấy dữ liệu hoạt động
    useEffect(() => {
        if (!userId) return;
        loadActivities(selectedRange);
    }, [selectedRange, userId]);

    const loadActivities = async (range: RangeType) => {
        try {
            setLoading(true);
            const data = await fetchDailyActivity(userId!, range);
            setActivities(data as ActivityData[]);
        } catch (e) {
            console.error("Lỗi tải dữ liệu:", e);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    // Tính toán dữ liệu hiển thị
    const statsData = useMemo(() => {
        if (activities.length === 0) {
            return {
                totalSteps: 0,
                goal: GOAL_MAP[selectedRange],
                totalCalories: 0,
                totalDistance: 0,
                totalDuration: 0,
                chartLabels: [],
                chartData: [],
            };
        }

        const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0);
        const totalCalories = activities.reduce((sum, a) => sum + (a.calories || 0), 0);
        const totalDistance = Math.round((totalSteps * 0.0008 * 10) / 10); // 0.0008 km per step
        const totalDuration = Math.round(totalSteps / 100); // 100 steps ≈ 1 minute

        const chartLabels = activities.map((a) => {
            const date = new Date(a.date);
            if (selectedRange === "week") {
                const days = ["M", "T", "W", "T", "F", "S", "S"];
                return days[date.getDay()] || "?";
            } else if (selectedRange === "month") {
                return date.getDate().toString();
            } else {
                return `W${Math.ceil(date.getDate() / 7)}`;
            }
        });

        const chartData = activities.map((a) => a.steps || 0);

        return {
            totalSteps,
            goal: GOAL_MAP[selectedRange],
            totalCalories,
            totalDistance,
            totalDuration,
            chartLabels,
            chartData,
        };
    }, [activities, selectedRange]);

    const progress = Math.min(1, statsData.totalSteps / statsData.goal);
    const percentage = Math.round(progress * 100);

    if (loading && activities.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#00BCD4" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Text style={styles.title}>Steps</Text>

            {/* Achievement Text */}
            <Text style={styles.achievementText}>
                You have achieved
                <Text style={styles.percentText}> {percentage}% </Text>
                of your goal
                {selectedRange === "week" ? " this week" : ""}
            </Text>

            {/* Circular Progress */}
            <View style={styles.circleWrapper}>
                <View style={styles.circleProgressContainer}>
                    <AntDesign name="step-forward" size={32} color="#00BCD4" />
                    <Text style={styles.totalValue}>
                        {statsData.totalSteps.toLocaleString()}
                    </Text>
                    <Text style={styles.totalLabel}>
                        Steps out of{" "}
                        {(statsData.goal / 1000).toLocaleString()}k
                    </Text>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <AntDesign name="fire" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{statsData.totalCalories}</Text>
                    <Text style={styles.statLabel}>kcal</Text>
                </View>
                <View style={styles.statItem}>
                    <AntDesign name="pushpin" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{statsData.totalDistance}</Text>
                    <Text style={styles.statLabel}>km</Text>
                </View>
                <View style={styles.statItem}>
                    <AntDesign name="clock-circle" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{statsData.totalDuration}</Text>
                    <Text style={styles.statLabel}>min</Text>
                </View>
            </View>

            {/* Range Selector */}
            <View style={styles.rangeSelector}>
                {(["week", "month", "quarter"] as RangeType[]).map((range) => (
                    <TouchableOpacity
                        key={range}
                        style={[
                            styles.rangeBtn,
                            selectedRange === range && styles.rangeBtnActive,
                        ]}
                        onPress={() => setSelectedRange(range)}
                    >
                        <Text
                            style={[
                                styles.rangeBtnText,
                                selectedRange === range &&
                                    styles.rangeBtnTextActive,
                            ]}
                        >
                            {range === "week"
                                ? "Weekly"
                                : range === "month"
                                ? "Monthly"
                                : "Quarterly"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Line Chart */}
            {!loading && statsData.chartData.length > 0 && (
                <View style={styles.chartCard}>
                    <LineChart
                        data={{
                            labels: statsData.chartLabels,
                            datasets: [
                                {
                                    data: statsData.chartData,
                                },
                            ],
                        }}
                        width={screenWidth - 40}
                        height={200}
                        chartConfig={{
                            backgroundGradientFrom: "#00BCD4",
                            backgroundGradientTo: "#00BCD4",
                            color: (opacity = 1) =>
                                `rgba(255, 255, 255, ${opacity})`,
                            labelColor: () => "#fff",
                            strokeWidth: 2,
                        }}
                        style={{ borderRadius: 16 }}
                        bezier
                    />
                </View>
            )}
    const stepData = {
        today: {
            steps: 11857,
            goal: 18000,
            calories: 850,
            distance: 5,
            duration: 120,
            chartData: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        data: [5000, 7000, 8000, 10000, 9000, 8500, 9500],
                    },
                ],
            },
        },
        weekly: {
            steps: 59357,
            goal: 126000, // 18k * 7
            calories: 5950,
            distance: 35,
            duration: 840,
            chartData: {
                labels: ["W1", "W2", "W3", "W4"],
                datasets: [
                    {
                        data: [50000, 55000, 59357, 52000],
                    },
                ],
            },
        },
        monthly: {
            steps: 250000,
            goal: 540000, // 18k * 30
            calories: 25000,
            distance: 150,
            duration: 3600,
            chartData: {
                labels: ["Week1", "Week2", "Week3", "Week4"],
                datasets: [
                    {
                        data: [59357, 62000, 65000, 63643],
                    },
                ],
            },
        },
    };

    const currentData = stepData[selectedRange];
    const progress = Math.min(1, currentData.steps / currentData.goal);
    const percentage = Math.round(progress * 100);

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Text style={styles.title}>Steps</Text>

            {/* Achievement Text */}
            <Text style={styles.achievementText}>
                You have achieved
                <Text style={styles.percentText}> {percentage}% </Text>
                of your goal
                {selectedRange === "today" ? " today" : ""}
            </Text>

            {/* Circular Progress */}
            <View style={styles.circleWrapper}>
                <View style={styles.circleProgressContainer}>
                    <AntDesign name="step-forward" size={32} color="#00BCD4" />
                    <Text style={styles.totalValue}>
                        {currentData.steps.toLocaleString()}
                    </Text>
                    <Text style={styles.totalLabel}>
                        Steps out of{" "}
                        {(currentData.goal / 1000).toLocaleString()}k
                    </Text>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <AntDesign name="fire" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{currentData.calories}</Text>
                    <Text style={styles.statLabel}>kcal</Text>
                </View>
                <View style={styles.statItem}>
                    <AntDesign name="pushpin" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{currentData.distance}</Text>
                    <Text style={styles.statLabel}>km</Text>
                </View>
                <View style={styles.statItem}>
                    <AntDesign name="clock-circle" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{currentData.duration}</Text>
                    <Text style={styles.statLabel}>min</Text>
                </View>
            </View>

            {/* Range Selector */}
            <View style={styles.rangeSelector}>
                {(["today", "weekly", "monthly"] as RangeType[]).map(
                    (range) => (
                        <TouchableOpacity
                            key={range}
                            style={[
                                styles.rangeBtn,
                                selectedRange === range &&
                                    styles.rangeBtnActive,
                            ]}
                            onPress={() => setSelectedRange(range)}
                        >
                            <Text
                                style={[
                                    styles.rangeBtnText,
                                    selectedRange === range &&
                                        styles.rangeBtnTextActive,
                                ]}
                            >
                                {range === "today"
                                    ? "Today"
                                    : range === "weekly"
                                    ? "Weekly"
                                    : "Monthly"}
                            </Text>
                        </TouchableOpacity>
                    )
                )}
            </View>

            {/* Line Chart */}
            <View style={styles.chartCard}>
                <LineChart
                    data={currentData.chartData}
                    width={screenWidth - 40}
                    height={200}
                    chartConfig={{
                        backgroundGradientFrom: "#00BCD4",
                        backgroundGradientTo: "#00BCD4",
                        color: (opacity = 1) =>
                            `rgba(255, 255, 255, ${opacity})`,
                        labelColor: () => "#fff",
                        strokeWidth: 2,
                    }}
                    style={{ borderRadius: 16 }}
                    bezier
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 16,
        paddingBottom: 30,
    },

    title: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        color: "#222",
        marginTop: 16,
        marginBottom: 20,
    },

    achievementText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },

    percentText: {
        color: "#00BCD4",
        fontWeight: "800",
        fontSize: 20,
    },

    circleWrapper: {
        alignItems: "center",
        marginBottom: 40,
    },

    circleProgressContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 10,
        borderColor: "#00BCD4",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    totalValue: {
        fontSize: 32,
        fontWeight: "900",
        color: "#333",
        marginTop: 8,
    },

    totalLabel: {
        fontSize: 11,
        color: "#999",
        marginTop: 4,
        textAlign: "center",
    },

    statsGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 30,
    },

    statItem: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: "center",
        elevation: 1,
    },

    statValue: {
        fontSize: 20,
        fontWeight: "800",
        color: "#333",
        marginTop: 8,
    },

    statLabel: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },

    rangeSelector: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 24,
    },

    rangeBtn: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#E0F7FA",
        borderRadius: 24,
        alignItems: "center",
    },

    rangeBtnActive: {
        backgroundColor: "#00BCD4",
    },

    rangeBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#00BCD4",
    },

    rangeBtnTextActive: {
        color: "#fff",
        fontWeight: "700",
    },

    chartCard: {
        backgroundColor: "#00BCD4",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginBottom: 30,
        elevation: 2,
    },
});
