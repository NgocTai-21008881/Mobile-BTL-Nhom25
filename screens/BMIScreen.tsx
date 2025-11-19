import React, { useMemo, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

interface BMIRecord {
    date: string;
    bmi: number;
}

export default function BMIScreen() {
    const [bmiRecords, setBmiRecords] = useState<BMIRecord[]>([
        { date: "2024-11-10", bmi: 22.5 },
        { date: "2024-11-11", bmi: 22.6 },
        { date: "2024-11-12", bmi: 22.4 },
        { date: "2024-11-13", bmi: 22.8 },
        { date: "2024-11-14", bmi: 22.7 },
        { date: "2024-11-15", bmi: 22.9 },
        { date: "2024-11-16", bmi: 23.0 },
    ]);
    const [height, setHeight] = useState("170");
    const [weight, setWeight] = useState("70");
    const [modalVisible, setModalVisible] = useState(false);
    const [nutritionModalVisible, setNutritionModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const calculateBMI = (w: number, h: number): number => {
        if (w <= 0 || h <= 0) return 0;
        return parseFloat((w / ((h / 100) * (h / 100))).toFixed(1));
    };

    const saveBMI = async () => {
        if (!height || !weight) {
            Alert.alert("Lỗi", "Vui lòng nhập cân nặng và chiều cao");
            return;
        }

        setIsSaving(true);
        const bmi = calculateBMI(parseFloat(weight), parseFloat(height));

        try {
            const newRecord: BMIRecord = {
                date: new Date().toISOString().split("T")[0],
                bmi: bmi,
            };

            setBmiRecords([...bmiRecords.slice(1), newRecord]);
            setModalVisible(false);
            Alert.alert("Thành công", `BMI của bạn: ${bmi}`);
        } catch (e: any) {
            console.error(e);
            Alert.alert("Lỗi", e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const avgBMI = useMemo(
        () =>
            bmiRecords.length > 0
                ? (
                      bmiRecords.reduce((a, b) => a + b.bmi, 0) /
                      bmiRecords.length
                  ).toFixed(1)
                : "0",
        [bmiRecords]
    );

    const category =
        parseFloat(avgBMI) < 18.5
            ? "Thiếu cân"
            : parseFloat(avgBMI) < 24.9
            ? "Bình thường"
            : parseFloat(avgBMI) < 29.9
            ? "Thừa cân"
            : "Béo phì";

    const color =
        category === "Thiếu cân"
            ? "#3B82F6"
            : category === "Bình thường"
            ? "#10B981"
            : category === "Thừa cân"
            ? "#F59E0B"
            : "#EF4444";

    const currentBMI = calculateBMI(parseFloat(weight), parseFloat(height));

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chỉ số BMI</Text>
                <Text style={styles.headerSubtitle}>
                    Theo dõi chỉ số cơ thể của bạn
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* BMI Summary Card */}
                <View style={[styles.card, { borderColor: color }]}>
                    <Text style={styles.cardLabel}>Chỉ số trung bình</Text>
                    <Text style={[styles.cardValue, { color }]}>{avgBMI}</Text>
                    <Text style={[styles.cardHint, { color }]}>{category}</Text>
                </View>

                {/* BMI Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>
                        Diễn biến BMI trong tuần
                    </Text>
                    <View style={styles.chartArea}>
                        {bmiRecords.map((record, i) => {
                            const barHeight = (record.bmi / 30) * 120;
                            return (
                                <View key={i} style={styles.barWrap}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: barHeight,
                                                backgroundColor: color,
                                            },
                                        ]}
                                    />
                                    <Text style={styles.barLabel}>
                                        {days[i]}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#3B82F6" },
                                ]}
                            />
                            <Text style={styles.legendText}>Thiếu cân</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#10B981" },
                                ]}
                            />
                            <Text style={styles.legendText}>Bình thường</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#F59E0B" },
                                ]}
                            />
                            <Text style={styles.legendText}>Thừa cân</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: "#EF4444" },
                                ]}
                            />
                            <Text style={styles.legendText}>Béo phì</Text>
                        </View>
                    </View>
                </View>

                {/* Health Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Giải thích nhanh</Text>
                    <View style={styles.infoRow}>
                        <Text
                            style={[
                                styles.infoBadge,
                                { backgroundColor: "#DBEAFE" },
                            ]}
                        >
                            Thiếu cân {"<18.5"}
                        </Text>
                        <Text
                            style={[
                                styles.infoBadge,
                                { backgroundColor: "#D1FAE5" },
                            ]}
                        >
                            Bình thường 18.5–24.9
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text
                            style={[
                                styles.infoBadge,
                                { backgroundColor: "#FEF3C7" },
                            ]}
                        >
                            Thừa cân 25–29.9
                        </Text>
                        <Text
                            style={[
                                styles.infoBadge,
                                { backgroundColor: "#FEE2E2" },
                            ]}
                        >
                            Béo phì ≥30
                        </Text>
                    </View>
                </View>

                {/* Tips Section */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>
                        Lời khuyên duy trì BMI khỏe mạnh
                    </Text>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>🥗</Text>
                        <Text style={styles.tipText}>
                            Ăn nhiều rau, trái cây và ngũ cốc nguyên hạt.
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>🏃</Text>
                        <Text style={styles.tipText}>
                            Tập thể dục tối thiểu 30 phút mỗi ngày.
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipDot}>💧</Text>
                        <Text style={styles.tipText}>
                            Uống đủ nước và hạn chế đồ uống có đường.
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.shortcuts}>
                    <TouchableOpacity
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#ECFDF5" },
                        ]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.shortcutEmoji}>📊</Text>
                        <Text style={styles.shortcutTitle}>Tính lại BMI</Text>
                        <Text style={styles.shortcutDesc}>
                            Nhập cân nặng & chiều cao
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.shortcut,
                            { backgroundColor: "#EFF6FF" },
                        ]}
                        onPress={() => setNutritionModalVisible(true)}
                    >
                        <Text style={styles.shortcutEmoji}>🩺</Text>
                        <Text style={styles.shortcutTitle}>
                            Tư vấn dinh dưỡng
                        </Text>
                        <Text style={styles.shortcutDesc}>
                            Xem chế độ ăn phù hợp
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal Tính BMI */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalBg}
                >
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
                            <Text style={styles.modalTitle}>Tính BMI</Text>
                            <View style={{ width: 28 }} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Chiều cao (cm)
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: 170"
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Cân nặng (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: 70"
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={styles.resultBox}>
                            <Text style={styles.resultLabel}>Kết quả BMI</Text>
                            <Text style={styles.resultValue}>{currentBMI}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={saveBMI}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmTxt}>Lưu lại</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Modal Tư vấn Dinh dưỡng */}
            <Modal
                visible={nutritionModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setNutritionModalVisible(false)}
            >
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalBg}
                >
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setNutritionModalVisible(false)}
                    />
                    <View style={styles.nutritionModal}>
                        <View style={styles.nutritionModalHead}>
                            <TouchableOpacity
                                onPress={() => setNutritionModalVisible(false)}
                            >
                                <AntDesign
                                    name="close"
                                    size={28}
                                    color="#5865F2"
                                />
                            </TouchableOpacity>
                            <Text style={styles.nutritionModalTitle}>
                                Tư vấn Dinh dưỡng
                            </Text>
                            <View style={{ width: 28 }} />
                        </View>

                        <ScrollView
                            style={styles.nutritionContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Lựa chọn danh mục */}
                            <View style={styles.categoryTabs}>
                                <TouchableOpacity
                                    style={[
                                        styles.categoryTab,
                                        { backgroundColor: "#10B981" },
                                    ]}
                                >
                                    <Text style={styles.categoryTabText}>
                                        Bình thường
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.categoryTab,
                                        { backgroundColor: "#F59E0B" },
                                    ]}
                                >
                                    <Text style={styles.categoryTabText}>
                                        Thừa cân
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.categoryTab,
                                        { backgroundColor: "#EF4444" },
                                    ]}
                                >
                                    <Text style={styles.categoryTabText}>
                                        Béo phì
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Khuyến nghị dinh dưỡng */}
                            <View style={styles.nutritionSection}>
                                <Text style={styles.sectionTitle}>
                                    🍽️ Khuyến nghị hàng ngày
                                </Text>
                                <View style={styles.nutritionCard}>
                                    <View style={styles.nutritionRow}>
                                        <Text style={styles.nutritionLabel}>
                                            Calo
                                        </Text>
                                        <Text style={styles.nutritionValue}>
                                            1800-2200 kcal
                                        </Text>
                                    </View>
                                    <View style={styles.nutritionRow}>
                                        <Text style={styles.nutritionLabel}>
                                            Protein
                                        </Text>
                                        <Text style={styles.nutritionValue}>
                                            50-60g
                                        </Text>
                                    </View>
                                    <View style={styles.nutritionRow}>
                                        <Text style={styles.nutritionLabel}>
                                            Carbs
                                        </Text>
                                        <Text style={styles.nutritionValue}>
                                            225-275g
                                        </Text>
                                    </View>
                                    <View style={styles.nutritionRow}>
                                        <Text style={styles.nutritionLabel}>
                                            Chất béo
                                        </Text>
                                        <Text style={styles.nutritionValue}>
                                            50-65g
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Thực phẩm nên ăn */}
                            <View style={styles.nutritionSection}>
                                <Text style={styles.sectionTitle}>
                                    ✅ Thực phẩm nên ăn
                                </Text>
                                <View style={styles.foodList}>
                                    <View style={styles.foodItem}>
                                        <Text style={styles.foodEmoji}>🥬</Text>
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodName}>
                                                Rau xanh
                                            </Text>
                                            <Text style={styles.foodDesc}>
                                                Salad, cần, rau bina, bông cải
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.foodItem}>
                                        <Text style={styles.foodEmoji}>🐔</Text>
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodName}>
                                                Thịt nạc
                                            </Text>
                                            <Text style={styles.foodDesc}>
                                                Gà, cá, thịt bò nạc
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.foodItem}>
                                        <Text style={styles.foodEmoji}>🍎</Text>
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodName}>
                                                Trái cây
                                            </Text>
                                            <Text style={styles.foodDesc}>
                                                Táo, cam, dâu, chuối
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.foodItem}>
                                        <Text style={styles.foodEmoji}>🌾</Text>
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodName}>
                                                Ngũ cốc nguyên hạt
                                            </Text>
                                            <Text style={styles.foodDesc}>
                                                Gạo lứt, lúa mạch, yến mạch
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Thực phẩm nên tránh */}
                            <View style={styles.nutritionSection}>
                                <Text style={styles.sectionTitle}>
                                    ❌ Thực phẩm nên tránh
                                </Text>
                                <View style={styles.foodList}>
                                    <View style={styles.foodItem}>
                                        <Text style={styles.foodEmoji}>🍔</Text>
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodName}>
                                                Đồ ăn nhanh
                                            </Text>
                                            <Text style={styles.foodDesc}>
                                                Burger, pizza, chiên rán
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.foodItem}>
                                        <Text style={styles.foodEmoji}>🍰</Text>
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodName}>
                                                Đồ ngọt
                                            </Text>
                                            <Text style={styles.foodDesc}>
                                                Bánh, kẹo, nước ngọt
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.foodItem}>
                                        <Text style={styles.foodEmoji}>🧈</Text>
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodName}>
                                                Dầu mỡ thừa
                                            </Text>
                                            <Text style={styles.foodDesc}>
                                                Bơ, dầu ăn, mỡ lợn
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.foodItem}>
                                        <Text style={styles.foodEmoji}>🥓</Text>
                                        <View style={styles.foodInfo}>
                                            <Text style={styles.foodName}>
                                                Thịt mỡ
                                            </Text>
                                            <Text style={styles.foodDesc}>
                                                Thịt đỏ, thịt xông khói
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Lời khuyên bổ sung */}
                            <View style={styles.nutritionSection}>
                                <Text style={styles.sectionTitle}>
                                    💡 Lời khuyên bổ sung
                                </Text>
                                <View style={styles.adviceList}>
                                    <View style={styles.adviceItem}>
                                        <Text style={styles.adviceNumber}>
                                            1
                                        </Text>
                                        <Text style={styles.adviceText}>
                                            Chia nhỏ bữa ăn thành 5-6 bữa/ngày
                                        </Text>
                                    </View>
                                    <View style={styles.adviceItem}>
                                        <Text style={styles.adviceNumber}>
                                            2
                                        </Text>
                                        <Text style={styles.adviceText}>
                                            Uống 2-3 lít nước mỗi ngày
                                        </Text>
                                    </View>
                                    <View style={styles.adviceItem}>
                                        <Text style={styles.adviceNumber}>
                                            3
                                        </Text>
                                        <Text style={styles.adviceText}>
                                            Tập thể dục 30 phút mỗi ngày
                                        </Text>
                                    </View>
                                    <View style={styles.adviceItem}>
                                        <Text style={styles.adviceNumber}>
                                            4
                                        </Text>
                                        <Text style={styles.adviceText}>
                                            Ăn chậm và nhai kỹ
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
    header: { marginBottom: 16 },
    headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
    headerSubtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 20,
    },
    cardLabel: { fontSize: 14, color: "#6B7280", fontWeight: "700" },
    cardValue: { fontSize: 42, fontWeight: "800", marginVertical: 4 },
    cardHint: { fontSize: 16, fontWeight: "700" },

    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 10,
    },
    chartArea: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        height: 140,
    },
    barWrap: { alignItems: "center", flex: 1 },
    bar: { width: 16, borderRadius: 8 },
    barLabel: { marginTop: 6, fontSize: 12, color: "#475569" },
    chartLegend: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    legendItem: { flexDirection: "row", alignItems: "center" },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 12, color: "#475569" },

    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    infoBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        fontSize: 12,
        color: "#111",
        fontWeight: "600",
    },

    tipsCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 10,
    },
    tipItem: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    tipDot: { fontSize: 16, marginRight: 8 },
    tipText: { color: "#334155", fontSize: 13, flex: 1 },

    shortcuts: { flexDirection: "row", gap: 12 },
    shortcut: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 12,
        alignItems: "center",
    },
    shortcutEmoji: { fontSize: 22, marginBottom: 8 },
    shortcutTitle: { fontWeight: "800", color: "#0F172A" },
    shortcutDesc: { color: "#64748B", fontSize: 12, marginTop: 2 },

    // Modal styles
    modalBg: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    modalBackdrop: {
        flex: 1,
    },
    modal: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: 32,
    },
    modalHead: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 28,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#5865F2",
        textAlign: "center",
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#F9FAFB",
    },
    resultBox: {
        backgroundColor: "#F0F4FF",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        marginBottom: 24,
    },
    resultLabel: {
        fontSize: 14,
        color: "#5865F2",
        fontWeight: "600",
    },
    resultValue: {
        fontSize: 36,
        fontWeight: "800",
        color: "#5865F2",
        marginTop: 4,
    },
    confirmBtn: {
        backgroundColor: "#5865F2",
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
        shadowColor: "#5865F2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    confirmTxt: {
        fontSize: 17,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: 0.5,
    },

    // Nutrition Modal Styles
    nutritionModal: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        maxHeight: "90%",
    },
    nutritionModalHead: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    nutritionModalTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#5865F2",
        textAlign: "center",
        flex: 1,
    },
    nutritionContent: {
        paddingBottom: 20,
    },
    categoryTabs: {
        flexDirection: "row",
        marginBottom: 24,
        gap: 8,
    },
    categoryTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
    },
    categoryTabText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    nutritionSection: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 12,
    },
    nutritionCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    nutritionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    nutritionLabel: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "600",
    },
    nutritionValue: {
        fontSize: 14,
        color: "#5865F2",
        fontWeight: "700",
    },
    foodList: {
        gap: 12,
    },
    foodItem: {
        flexDirection: "row",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    foodEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 4,
    },
    foodDesc: {
        fontSize: 12,
        color: "#6B7280",
    },
    adviceList: {
        gap: 12,
    },
    adviceItem: {
        flexDirection: "row",
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#5865F2",
    },
    adviceNumber: {
        fontSize: 16,
        fontWeight: "800",
        color: "#5865F2",
        marginRight: 12,
        minWidth: 30,
    },
    adviceText: {
        fontSize: 13,
        color: "#334155",
        flex: 1,
        lineHeight: 20,
    },
});
