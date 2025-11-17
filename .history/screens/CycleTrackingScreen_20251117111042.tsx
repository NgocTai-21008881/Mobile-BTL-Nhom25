import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

const screenWidth = Dimensions.get("window").width;

export default function CycleTrackingScreen() {
    const [userId, setUserId] = useState<string | null>(null);
    const [cycleData, setCycleData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [daysBeforePeriod, setDaysBeforePeriod] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [cycleLength, setCycleLength] = useState("28");
    const [startDate, setStartDate] = useState(new Date());

    useEffect(() => {
        loadCycleData();
    }, []);

    const loadCycleData = async () => {
        try {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                setUserId(user.id);
                // Lấy dữ liệu chu kỳ
                const { data, error } = await supabase
                    .from("cycle_tracking")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("start_date", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error("Lỗi:", error);
                } else if (data) {
                    setCycleData(data);
                    setCycleLength(data.average_length?.toString() || "28");
                    setStartDate(new Date(data.start_date));
                    calculateDaysBeforePeriod(data);
                }
            }
        } catch (error) {
            console.error("Lỗi load data:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDaysBeforePeriod = (data: any) => {
        if (!data?.start_date) {
            setDaysBeforePeriod(0);
            return;
        }

        const startDate = new Date(data.start_date);
        const today = new Date();
        const daysElapsed = Math.floor(
            (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const cycleLen = data.average_length || 28;
        const days = cycleLen - (daysElapsed % cycleLen);
        setDaysBeforePeriod(Math.max(0, days));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setStartDate(selectedDate);
        }
        if (event.type !== "dismissed") {
            setShowDatePicker(false);
        }
    };

    const handleSaveCycleData = async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from("cycle_tracking")
                .upsert([
                    {
                        user_id: userId,
                        start_date: startDate.toISOString().split("T")[0],
                        average_length: parseInt(cycleLength) || 28,
                    },
                ])
                .select()
                .single();

            if (error) {
                Alert.alert("Lỗi", "Không thể lưu dữ liệu");
                console.error(error);
            } else {
                setCycleData(data);
                calculateDaysBeforePeriod(data);
                setEditModalVisible(false);
                Alert.alert("Thành công", "Dữ liệu chu kỳ đã được cập nhật");
            }
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return String(date.getDate()).padStart(2, "0");
    });

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
            <Text style={styles.title}>Cycle Tracking</Text>

            <View style={styles.dateRow}>
                {days.map((d, index) => (
                    <View key={index} style={styles.dateItem}>
                        <Text style={styles.dayText}>{d}</Text>
                        <View
                            style={[
                                styles.dateCircle,
                                index === 6 && styles.dateCircleActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dateNumber,
                                    index === 6 && styles.dateNumberActive,
                                ]}
                            >
                                {dates[index]}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.periodContainer}>
                <View style={styles.periodCircle}>
                    <Text style={styles.periodText}>Period in</Text>
                    <Text style={styles.periodDays}>
                        {daysBeforePeriod} days
                    </Text>
                    <Text style={styles.periodSub}>
                        {daysBeforePeriod <= 5
                            ? "High chance of getting pregnant"
                            : daysBeforePeriod <= 10
                            ? "Moderate chance of getting pregnant"
                            : "Low chance of getting pregnant"}
                    </Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setEditModalVisible(true)}
                    >
                        <Text style={styles.editButtonText}>
                            Edit period dates
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cycle Info</Text>
            </View>
            <View style={styles.infoRow}>
                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Cycle Length</Text>
                    <Text style={styles.infoValue}>
                        {cycleData?.average_length || 28} days
                    </Text>
                </View>
                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Last Period</Text>
                    <Text style={styles.infoValue}>
                        {cycleData?.start_date
                            ? new Date(cycleData.start_date).toLocaleDateString(
                                  "vi-VN"
                              )
                            : "Not set"}
                    </Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    How are you feeling today?
                </Text>
            </View>
            <View style={styles.feelingRow}>
                <TouchableOpacity style={styles.feelingCard}>
                    <Text style={styles.feelingIcon}>💬</Text>
                    <Text style={styles.feelingText}>Share your symptoms</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.feelingCard}>
                    <Text style={styles.feelingIcon}>📊</Text>
                    <Text style={styles.feelingText}>Daily insights</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Health Tips</Text>
                <TouchableOpacity>
                    <Text style={styles.viewMore}>View more ›</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.articleRow}>
                <View style={styles.articleCard}>
                    <Image
                        source={require("../assets/keo.jpg")}
                        style={styles.articleImage}
                    />
                    <Text style={styles.articleText} numberOfLines={3}>
                        Craving sweets on your period? Here's why
                    </Text>
                </View>
                <View style={styles.articleCard}>
                    <Image
                        source={require("../assets/thuoc.jpg")}
                        style={styles.articleImage}
                    />
                    <Text style={styles.articleText} numberOfLines={3}>
                        Birth control & menstrual health
                    </Text>
                </View>
            </View>

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Edit Cycle Information
                            </Text>
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                            >
                                <AntDesign
                                    name="close"
                                    size={24}
                                    color="#111827"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    Last Period Date (YYYY-MM-DD)
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={
                                        startDate.toISOString().split("T")[0]
                                    }
                                    onChangeText={(text) =>
                                        setStartDate(new Date(text))
                                    }
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    Cycle Length (days)
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={cycleLength}
                                    onChangeText={setCycleLength}
                                    keyboardType="number-pad"
                                    placeholder="28"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveCycleData}
                            >
                                <Text style={styles.saveButtonText}>
                                    Save Changes
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

// 💅 Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1F2937",
        textAlign: "center",
        marginBottom: 20,
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
    },
    dateItem: {
        alignItems: "center",
    },
    dayText: {
        color: "#9CA3AF",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 6,
    },
    dateCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E5E7EB",
    },
    dateCircleActive: {
        backgroundColor: "#5865F2",
        shadowColor: "#5865F2",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    dateNumber: {
        color: "#6B7280",
        fontWeight: "700",
        fontSize: 14,
    },
    dateNumberActive: {
        color: "#fff",
    },
    periodContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    periodCircle: {
        width: screenWidth * 0.75,
        height: screenWidth * 0.75,
        borderRadius: (screenWidth * 0.75) / 2,
        backgroundColor: "rgba(88,101,242,0.12)",
        justifyContent: "center",
        alignItems: "center",
    },
    periodText: {
        color: "#6B7280",
        fontSize: 15,
        marginBottom: 6,
        fontWeight: "600",
    },
    periodDays: {
        fontSize: 36,
        fontWeight: "800",
        color: "#5865F2",
    },
    periodSub: {
        color: "#9CA3AF",
        fontSize: 13,
        marginTop: 8,
        fontWeight: "500",
    },
    editButton: {
        marginTop: 16,
        backgroundColor: "#fff",
        borderRadius: 24,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: "#5865F2",
        shadowColor: "#5865F2",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    editButtonText: {
        color: "#5865F2",
        fontWeight: "700",
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1F2937",
    },
    viewMore: {
        color: "#FF7F00",
        fontWeight: "700",
        fontSize: 14,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
    },
    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        width: "48%",
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    infoLabel: {
        color: "#9CA3AF",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 6,
    },
    infoValue: {
        color: "#FF7F00",
        fontSize: 16,
        fontWeight: "800",
    },
    feelingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
    },
    feelingCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        width: "48%",
        padding: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    feelingIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    feelingText: {
        color: "#6B7280",
        textAlign: "center",
        fontSize: 13,
        fontWeight: "600",
    },
    articleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    articleCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        width: "48%",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    articleImage: {
        width: "100%",
        height: 110,
        resizeMode: "cover",
    },
    articleText: {
        padding: 12,
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "600",
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1F2937",
    },
    modalBody: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#6B7280",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: "#1F2937",
    },
    saveButton: {
        backgroundColor: "#FF7F00",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#FF7F00",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 16,
    },
});
