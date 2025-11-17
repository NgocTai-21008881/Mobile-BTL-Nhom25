import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { getBMIRecords } from "../services/bmiService";
import { supabase } from "../lib/supabase";

export default function BMIScreen() {
    const [bmiData, setBmiData] = useState<number[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user?.id) setUserId(data.user.id);
        })();
    }, []);

    useEffect(() => {
        if (!userId) return;
        loadBMIData();
    }, [userId]);

    const loadBMIData = async () => {
        try {
            setLoading(true);
            const data = await getBMIRecords(userId!, "week");
            if (data.length > 0) {
                setBmiData(data.map((d: any) => d.bmi));
                setLabels(
                    data.map((d: any) =>
                        new Date(d.date).toLocaleDateString("vi-VN", {
                            weekday: "short",
                        })
                    )
                );
            }
        } catch (e) {
            console.error("Lỗi tải BMI:", e);
        } finally {
            setLoading(false);
        }
    };

    const avgBMI = useMemo(
        () =>
            bmiData.length > 0
                ? (bmiData.reduce((a, b) => a + b, 0) / bmiData.length).toFixed(
                      1
                  )
                : "0",
        [bmiData]
    );

    const category = useMemo(() => {
        const bmi = parseFloat(avgBMI);
        if (bmi < 18.5) return "Thiếu cân";
        if (bmi < 24.9) return "Bình thường";
        if (bmi < 29.9) return "Thừa cân";
        return "Béo phì";
    }, [avgBMI]);

    if (loading) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <ActivityIndicator size="large" color="#4BC7E2" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.headerTitle}>BMI Index</Text>
            <Text style={styles.headerSubtitle}>
                Chỉ số khối cơ thể của bạn
            </Text>

            {/* BMI Card */}
            <View style={[styles.card, { borderColor: "#4BC7E2" }]}>
                <Text style={styles.cardLabel}>BMI Trung bình</Text>
                <Text style={styles.cardValue}>{avgBMI}</Text>
                <Text style={styles.category}>{category}</Text>
            </View>

            {/* Chart */}
            <View style={styles.chartCard}>
                <View style={styles.chartArea}>
                    {bmiData.map((v, i) => (
                        <View key={i} style={styles.barWrap}>
                            <View
                                style={[
                                    styles.bar,
                                    { height: Math.max(20, v * 5) },
                                ]}
                            />
                            <Text style={styles.barLabel}>{labels[i]}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>Lời khuyên</Text>
                <Text style={styles.tipsText}>
                    • Ăn cân bằng và tập luyện thường xuyên.
                </Text>
                <Text style={styles.tipsText}>• Uống đủ nước mỗi ngày.</Text>
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
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        alignItems: "center",
        marginBottom: 20,
    },
    cardLabel: { fontSize: 14, color: "#6B7280", fontWeight: "700" },
    cardValue: {
        fontSize: 40,
        fontWeight: "800",
        color: "#0F172A",
        marginVertical: 8,
    },
    category: { fontSize: 14, color: "#4BC7E2", fontWeight: "700" },
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
    bar: { width: 18, backgroundColor: "#4BC7E2", borderRadius: 4 },
    barLabel: { fontSize: 11, color: "#64748B", marginTop: 8 },
    tipsCard: { backgroundColor: "#EFF6FF", borderRadius: 16, padding: 16 },
    tipsTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 12,
    },
    tipsText: {
        fontSize: 13,
        color: "#374151",
        lineHeight: 20,
        marginBottom: 8,
    },
});
