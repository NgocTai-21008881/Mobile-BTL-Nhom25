import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { fetchDailyActivity, RangeKey } from "../services/activityService";
import { supabase } from "../lib/supabase";

export default function DoubleSupportScreen() {
    const [graphData, setGraphData] = useState<number[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState<RangeKey>("week");
    const [goal, setGoal] = useState(18000);
    const [userId, setUserId] = useState<string | null>(null);
    const [calories, setCalories] = useState(0);
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user?.id) {
                setUserId(data.user.id);
            }
        })();
    }, []);

    useEffect(() => {
        if (!userId) return;
        loadData(selectedRange);
    }, [selectedRange, userId]);

    const loadData = async (range: RangeKey) => {
        try {
            setLoading(true);
            const data = await fetchDailyActivity(userId!, range);

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
                return date.getDate().toString().padStart(2, "0");
            });
            setLabels(dayLabels);

            // Tính toán thống kê hôm nay (ngày cuối cùng)
            const today = data[data.length - 1];
            setCalories(Math.round((today.steps || 0) * 0.05)); // 1 bước = 0.05 kcal
            setDistance(Math.round((today.steps || 0) * 0.0008 * 10) / 10); // 1 bước = 0.0008 km
            setDuration(Math.round((today.steps || 0) / 100)); // Ước tính thời gian
        } catch (e) {
            console.error("Lỗi tải dữ liệu:", e);
            setGraphData([]);
            setLabels([]);
        } finally {
            setLoading(false);
        }
    };

    const maxVal = useMemo(
        () => Math.max(goal, ...graphData, 1),
        [graphData, goal]
    );

    const todaySteps = useMemo(() => {
        return graphData.length > 0 ? graphData[graphData.length - 1] : 0;
    }, [graphData]);

    const progress = Math.min(1, todaySteps / goal);

    if (loading && graphData.length === 0) {
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
            {/* Achievement Text */}
            <Text style={styles.achievementText}>
                You have achieved
                <Text style={styles.progressPercent}>
                    {" "}
                    {Math.round(progress * 100)}%{" "}
                </Text>
                of your goal today
            </Text>

            {/* Circle Progress */}
            <View style={styles.circleWrapper}>
                <View
                    style={[
                        styles.circleProgress,
                        {
                            borderColor: progress >= 1 ? "#4CAF50" : "#00BCD4",
                        },
                    ]}
                >
                    <View style={styles.circleInner}>
                        <AntDesign
                            name="stepforward"
                            size={28}
                            color="#00BCD4"
                        />
                        <Text style={styles.stepValue}>
                            {todaySteps.toLocaleString("en-US")}
                        </Text>
                        <Text style={styles.stepLabel}>
                            Steps out of {goal.toLocaleString("en-US")}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <AntDesign name="fire" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{calories}</Text>
                    <Text style={styles.statLabel}>kcal</Text>
                </View>
                <View style={styles.statCard}>
                    <AntDesign name="car" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{distance}</Text>
                    <Text style={styles.statLabel}>km</Text>
                </View>
                <View style={styles.statCard}>
                    <AntDesign name="clock-circle" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{duration}</Text>
                    <Text style={styles.statLabel}>min</Text>
                </View>
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
                                selectedRange === r && styles.rangeTextActive,
                            ]}
                        >
                            {r === "week"
                                ? "Today"
                                : r === "month"
                                ? "Weekly"
                                : "Monthly"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Chart */}
            {!loading && graphData.length > 0 && (
                <View style={styles.chartCard}>
                    <View style={styles.chartContainer}>
                        <View style={styles.chartGridLines}>
                            {[...Array(4)].map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.gridLine,
                                        { bottom: `${(i + 1) * 25}%` },
                                    ]}
                                />
                            ))}
                        </View>

                        <View style={styles.chartArea}>
                            {graphData.map((v, i) => {
                                const h = Math.max(10, (v / maxVal) * 160);
                                return (
                                    <View key={i} style={styles.barPoint}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: h,
                                                    backgroundColor: "#fff",
                                                },
                                            ]}
                                        />
                                    </View>
                                );
                            })}
                        </View>

                        <View style={styles.chartLabels}>
                            {labels.map((label, i) => (
                                <Text key={i} style={styles.chartLabel}>
                                    {label}
                                </Text>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    achievementText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 28,
    },

    progressPercent: {
        color: "#00BCD4",
        fontWeight: "800",
        fontSize: 20,
    },

    circleWrapper: {
        alignItems: "center",
        marginBottom: 40,
    },

    circleProgress: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 10,
        borderColor: "#00BCD4",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    circleInner: {
        alignItems: "center",
        justifyContent: "center",
    },

    stepValue: {
        fontSize: 32,
        fontWeight: "900",
        color: "#333",
        marginTop: 8,
    },

    stepLabel: {
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

    statCard: {
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

    rangeText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#00BCD4",
    },

    rangeTextActive: {
        color: "#fff",
        fontWeight: "700",
    },

    chartCard: {
        backgroundColor: "#00BCD4",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginBottom: 30,
        elevation: 2,
    },

    chartContainer: {
        height: 220,
        position: "relative",
    },

    chartGridLines: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },

    gridLine: {
        position: "absolute",
        width: "100%",
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },

    chartArea: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 160,
        paddingBottom: 20,
        zIndex: 1,
    },

    barPoint: {
        alignItems: "center",
        flex: 1,
    },

    bar: {
        width: 16,
        borderRadius: 8,
    },

    chartLabels: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 12,
    },

    chartLabel: {
        fontSize: 11,
        color: "#fff",
        fontWeight: "600",
        flex: 1,
        textAlign: "center",
    },
});
