import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    FlatList,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { fetchDailyActivity } from "../services/activityService";
import { supabase } from "../lib/supabase";

interface FoodItem {
    id: string;
    name: string;
    calories: number;
    unit: string;
    emoji: string;
}

const commonFoods: FoodItem[] = [
    { id: "1", name: "Cơm trắng", calories: 250, unit: "1 bát", emoji: "🍚" },
    { id: "2", name: "Bánh mì", calories: 265, unit: "1 lát", emoji: "🥖" },
    { id: "3", name: "Gà nướng", calories: 300, unit: "100g", emoji: "🍗" },
    { id: "4", name: "Trứng chiên", calories: 155, unit: "1 quả", emoji: "🍳" },
    { id: "5", name: "Sữa tươi", calories: 150, unit: "1 cốc", emoji: "🥛" },
    { id: "6", name: "Chuối", calories: 105, unit: "1 quả", emoji: "🍌" },
    { id: "7", name: "Táo", calories: 95, unit: "1 quả", emoji: "🍎" },
    { id: "8", name: "Hamburger", calories: 450, unit: "1 chiếc", emoji: "🍔" },
    { id: "9", name: "Pizza", calories: 285, unit: "1 miếng", emoji: "🍕" },
    { id: "10", name: "Ramen", calories: 380, unit: "1 bát", emoji: "🍜" },
    { id: "11", name: "Cà phê", calories: 2, unit: "1 tách", emoji: "☕" },
    {
        id: "12",
        name: "Nước ngọt",
        calories: 140,
        unit: "1 chai 330ml",
        emoji: "🥤",
    },
];

export default function CaloriesScreen() {
    const [caloriesData, setCaloriesData] = useState<number[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [customCalories, setCustomCalories] = useState("");
    const [foodInput, setFoodInput] = useState("");
    const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user?.id) setUserId(data.user.id);
        })();
    }, []);

    useEffect(() => {
        if (!userId) return;
        loadCaloriesData();
    }, [userId]);

    const loadCaloriesData = async () => {
        try {
            setLoading(true);
            const data = await fetchDailyActivity(userId!, "week");
            if (data.length > 0) {
                setCaloriesData(
                    data.map(
                        (d: any) => d.calories || 1800 + Math.random() * 600
                    )
                );
                setLabels(
                    data.map((d: any) =>
                        new Date(d.date).toLocaleDateString("vi-VN", {
                            weekday: "short",
                        })
                    )
                );
            } else {
                // Dữ liệu mẫu
                setCaloriesData([2100, 1950, 2300, 2050, 2200, 1900, 2100]);
                setLabels(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
            }
        } catch (e) {
            console.error("Lỗi tải calories:", e);
            setCaloriesData([2100, 1950, 2300, 2050, 2200, 1900, 2100]);
            setLabels(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
        } finally {
            setLoading(false);
        }
    };

    const totalCalories = useMemo(
        () => caloriesData.reduce((a, b) => a + b, 0),
        [caloriesData]
    );

    const avgCalories = useMemo(
        () =>
            caloriesData.length > 0
                ? Math.round(totalCalories / caloriesData.length)
                : 0,
        [totalCalories, caloriesData]
    );

    const maxCalories = useMemo(
        () => (caloriesData.length > 0 ? Math.max(...caloriesData) : 2500),
        [caloriesData]
    );

    const addFoodCalories = (food: FoodItem) => {
        setSelectedFoods([...selectedFoods, food]);
    };

    const removeFoodCalories = (index: number) => {
        setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
    };

    const totalSelectedCalories = useMemo(
        () => selectedFoods.reduce((sum, food) => sum + food.calories, 0),
        [selectedFoods]
    );

    const saveCustomCalories = () => {
        if (!customCalories.trim() && selectedFoods.length === 0) {
            Alert.alert("Lỗi", "Vui lòng nhập calo hoặc chọn thực phẩm");
            return;
        }

        const totalCals =
            (customCalories ? parseFloat(customCalories) : 0) +
            totalSelectedCalories;
        Alert.alert("Thành công", `Bạn đã nhập ${totalCals} kcal`, [
            {
                text: "OK",
                onPress: () => {
                    setModalVisible(false);
                    setCustomCalories("");
                    setSelectedFoods([]);
                },
            },
        ]);
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

    const filteredFoods = commonFoods.filter((food) =>
        food.name.toLowerCase().includes(foodInput.toLowerCase())
    );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Calories</Text>
                <Text style={styles.headerSubtitle}>
                    Theo dõi calo tiêu hao mỗi ngày
                </Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Tổng tuần</Text>
                    <Text style={[styles.statValue, { color: "#5865F2" }]}>
                        {totalCalories}
                    </Text>
                    <Text style={styles.statUnit}>kcal</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Trung bình</Text>
                    <Text style={[styles.statValue, { color: "#5865F2" }]}>
                        {avgCalories}
                    </Text>
                    <Text style={styles.statUnit}>kcal/ngày</Text>
                </View>
            </View>

            {/* Chart */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Biểu đồ calo trong tuần</Text>
                <View style={styles.chartArea}>
                    {caloriesData.map((v, i) => {
                        const barHeight = (v / maxCalories) * 120;
                        const isSelected = selectedDay === i;
                        return (
                            <TouchableOpacity
                                key={i}
                                style={styles.barWrap}
                                onPress={() =>
                                    setSelectedDay(isSelected ? null : i)
                                }
                            >
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: barHeight,
                                            backgroundColor: isSelected
                                                ? "#5865F2"
                                                : "#A0C4FF",
                                        },
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.barLabel,
                                        isSelected && styles.barLabelSelected,
                                    ]}
                                >
                                    {labels[i]}
                                </Text>
                                {isSelected && (
                                    <Text style={styles.barValue}>
                                        {v} kcal
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => setModalVisible(true)}
            >
                <AntDesign name="plus" size={20} color="#fff" />
                <Text style={styles.ctaText}>Tính calo môn ăn</Text>
            </TouchableOpacity>

            {/* Tips */}
            <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>
                    💡 Lời khuyên cân bằng calo
                </Text>
                <View style={styles.tipItem}>
                    <Text style={styles.tipNumber}>1</Text>
                    <Text style={styles.tipText}>
                        Ăn 5 bữa nhỏ/ngày thay vì 3 bữa lớn
                    </Text>
                </View>
                <View style={styles.tipItem}>
                    <Text style={styles.tipNumber}>2</Text>
                    <Text style={styles.tipText}>
                        Tập luyện 30 phút mỗi ngày
                    </Text>
                </View>
                <View style={styles.tipItem}>
                    <Text style={styles.tipNumber}>3</Text>
                    <Text style={styles.tipText}>
                        Chọn thực phẩm lành mạnh, tự nhiên
                    </Text>
                </View>
                <View style={styles.tipItem}>
                    <Text style={styles.tipNumber}>4</Text>
                    <Text style={styles.tipText}>
                        Uống nước đủ, hạn chế đồ uống có đường
                    </Text>
                </View>
            </View>

            {/* Mục tiêu calo */}
            <View style={styles.goalCard}>
                <Text style={styles.goalTitle}>🎯 Mục tiêu calo hàng ngày</Text>
                <View style={styles.goalProgressBox}>
                    <View style={styles.goalBar}>
                        <View
                            style={[
                                styles.goalProgress,
                                {
                                    width:
                                        Math.min(
                                            100,
                                            (avgCalories / 2000) * 100
                                        ) + "%",
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.goalText}>
                        {avgCalories} / 2000 kcal
                    </Text>
                </View>
                <Text style={styles.goalDesc}>
                    Mục tiêu hàng ngày là 2000 kcal - Điều chỉnh theo cơ thể của
                    bạn
                </Text>
            </View>

            {/* Modal Tính Calo */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBg}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    />
                    <View style={styles.modal}>
                        <View style={styles.modalHead}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                            >
                                <AntDesign
                                    name="close"
                                    size={28}
                                    color="#5865F2"
                                />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Tính Calo</Text>
                            <View style={{ width: 28 }} />
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Manual Input */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Nhập calo trực tiếp
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="VD: 500 kcal"
                                    value={customCalories}
                                    onChangeText={setCustomCalories}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            {/* Food Search */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Chọn từ danh sách
                                </Text>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Tìm kiếm thực phẩm..."
                                    value={foodInput}
                                    onChangeText={setFoodInput}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            {/* Food List */}
                            <FlatList
                                scrollEnabled={false}
                                data={filteredFoods}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.foodCard}
                                        onPress={() => addFoodCalories(item)}
                                    >
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodEmoji}>
                                                {item.emoji}
                                            </Text>
                                            <View style={styles.foodDetails}>
                                                <Text style={styles.foodName}>
                                                    {item.name}
                                                </Text>
                                                <Text style={styles.foodUnit}>
                                                    {item.unit}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.foodCalories}>
                                            {item.calories} kcal
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />

                            {/* Selected Foods */}
                            {selectedFoods.length > 0 && (
                                <View style={styles.selectedFoodsSection}>
                                    <Text style={styles.sectionTitle}>
                                        Thực phẩm đã chọn
                                    </Text>
                                    {selectedFoods.map((food, index) => (
                                        <View
                                            key={index}
                                            style={styles.selectedFoodItem}
                                        >
                                            <Text
                                                style={styles.selectedFoodText}
                                            >
                                                {food.emoji} {food.name}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    removeFoodCalories(index)
                                                }
                                            >
                                                <AntDesign
                                                    name="close"
                                                    size={16}
                                                    color="#EF4444"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <View style={styles.totalCaloriesBox}>
                                        <Text style={styles.totalText}>
                                            Tổng calo:
                                        </Text>
                                        <Text style={styles.totalValue}>
                                            {totalSelectedCalories +
                                                (customCalories
                                                    ? parseFloat(customCalories)
                                                    : 0)}{" "}
                                            kcal
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={saveCustomCalories}
                        >
                            <Text style={styles.saveBtnText}>
                                Lưu {totalSelectedCalories > 0 ? "Calo" : ""}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
    header: { marginBottom: 24 },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 4,
    },
    headerSubtitle: { fontSize: 14, color: "#64748B" },
    statsGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        shadowColor: "#5865F2",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    statLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
    statValue: {
        fontSize: 32,
        fontWeight: "800",
        color: "#5865F2",
        marginVertical: 8,
    },
    statUnit: { fontSize: 11, color: "#9CA3AF" },
    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#5865F2",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 16,
    },
    chartArea: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 160,
    },
    barWrap: { alignItems: "center", flex: 1 },
    bar: { width: 20, backgroundColor: "#A0C4FF", borderRadius: 6 },
    barLabel: { fontSize: 12, color: "#6B7280", marginTop: 8, fontWeight: "600" },
    barLabelSelected: { color: "#5865F2", fontWeight: "700" },
    barValue: {
        fontSize: 11,
        color: "#5865F2",
        fontWeight: "700",
        marginTop: 4,
    },
    ctaButton: {
        backgroundColor: "#5865F2",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 24,
        shadowColor: "#5865F2",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
    },
    ctaText: { fontSize: 16, fontWeight: "700", color: "#fff" },
    tipsCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 16,
    },
    tipItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 12,
    },
    tipNumber: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
        backgroundColor: "#5865F2",
        width: 28,
        height: 28,
        borderRadius: 14,
        textAlignVertical: "center",
        textAlign: "center",
    },
    tipText: {
        fontSize: 13,
        color: "#374151",
        lineHeight: 20,
        flex: 1,
    },
    goalCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 16,
    },
    goalProgressBox: { marginBottom: 12 },
    goalBar: {
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    goalProgress: { backgroundColor: "#5865F2", height: "100%" },
    goalText: { fontSize: 14, fontWeight: "700", color: "#5865F2" },
    goalDesc: {
        fontSize: 12,
        color: "#6B7280",
        lineHeight: 18,
    },
    // Modal
    modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
    modalBackdrop: { flex: 1 },
    modal: {
        backgroundColor: "#F9FAFB",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
        paddingBottom: 40,
    },
    modalHead: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
    modalContent: { paddingHorizontal: 20, paddingTop: 16 },
    section: { marginBottom: 20 },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 12,
    },
    input: {
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: "#0F172A",
        backgroundColor: "#fff",
    },
    searchInput: {
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: "#0F172A",
        backgroundColor: "#fff",
    },
    foodCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    foodInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    foodEmoji: { fontSize: 24 },
    foodDetails: { flex: 1 },
    foodName: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
    foodUnit: { fontSize: 12, color: "#6B7280", marginTop: 2 },
    foodCalories: {
        fontSize: 13,
        fontWeight: "700",
        color: "#5865F2",
    },
    selectedFoodsSection: {
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },
    selectedFoodItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    selectedFoodText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0F172A",
    },
    totalCaloriesBox: {
        backgroundColor: "#5865F2",
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalText: { fontSize: 13, fontWeight: "700", color: "#fff" },
    totalValue: { fontSize: 16, fontWeight: "800", color: "#fff" },
    saveBtn: {
        backgroundColor: "#5865F2",
        borderRadius: 12,
        paddingVertical: 14,
        marginHorizontal: 20,
        alignItems: "center",
        marginTop: 16,
        shadowColor: "#5865F2",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
});
