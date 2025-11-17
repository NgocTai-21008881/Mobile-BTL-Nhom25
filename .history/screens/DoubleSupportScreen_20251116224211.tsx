import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

// Định nghĩa kiểu dữ liệu
interface DoubleSupportSession {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number; // phút
    activity: string;
}

type RangeType = "today" | "weekly" | "monthly";

const screenWidth = Dimensions.get("window").width;

export default function DoubleSupportScreen() {
    // State cho dữ liệu
    const [sessions, setSessions] = useState<DoubleSupportSession[]>([
        {
            id: "1",
            date: "2024-11-16",
            startTime: "06:00",
            endTime: "06:30",
            duration: 30,
            activity: "Chạy bộ + Yoga",
        },
        {
            id: "2",
            date: "2024-11-16",
            startTime: "18:00",
            endTime: "18:45",
            duration: 45,
            activity: "Tập gym",
        },
        {
            id: "3",
            date: "2024-11-15",
            startTime: "07:00",
            endTime: "07:30",
            duration: 30,
            activity: "Yoga + Thiền",
        },
        {
            id: "4",
            date: "2024-11-14",
            startTime: "18:30",
            endTime: "19:15",
            duration: 45,
            activity: "Chạy bộ + Stretching",
        },
        {
            id: "5",
            date: "2024-11-13",
            startTime: "07:00",
            endTime: "07:45",
            duration: 45,
            activity: "Tập luyện",
        },
    ]);

    const [selectedRange, setSelectedRange] = useState<RangeType>("today");
    const [modalVisible, setModalVisible] = useState(false);
    const [startTime, setStartTime] = useState("06:00");
    const [endTime, setEndTime] = useState("06:30");
    const [activity, setActivity] = useState("Tập luyện");

    // Cấu hình mục tiêu cho mỗi range
    const goalMap = {
        today: 120, // 120 phút/ngày
        weekly: 840, // 840 phút/tuần
        monthly: 3600, // 3600 phút/tháng
    };

    // Tính toán dữ liệu dựa trên range
    const getRangeData = (range: RangeType) => {
        const today = new Date();
        let filteredSessions: DoubleSupportSession[] = [];

        if (range === "today") {
            const todayStr = today.toISOString().split("T")[0];
            filteredSessions = sessions.filter((s) => s.date === todayStr);
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            filteredSessions = sessions.filter((s) => {
                const sessionDate = new Date(s.date);
                return (
                    sessionDate >= sevenDaysAgo && sessionDate <= today
                );
            });
        } else if (range === "monthly") {
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            filteredSessions = sessions.filter((s) => {
                const sessionDate = new Date(s.date);
                return (
                    sessionDate >= thirtyDaysAgo && sessionDate <= today
                );
            });
        }

        const total = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
        const goal = goalMap[range];
        const progress = Math.min(1, total / goal);
        const percentage = Math.round(progress * 100);

        return { total, goal, progress, percentage, filteredSessions };
    };

    const { total, goal, progress, percentage } = getRangeData(selectedRange);

    const statItems = useMemo(() => {
        const { filteredSessions } = getRangeData(selectedRange);

        let calories = 0;
        let distance = 0;
        let avgDuration = 0;

        if (filteredSessions.length > 0) {
            const totalMinutes = filteredSessions.reduce(
                (sum, s) => sum + s.duration,
                0
            );
            calories = Math.round(totalMinutes * 5); // 5 kcal/phút
            distance = Math.round((totalMinutes * 0.1 * 10) / 10); // 0.1 km/phút
            avgDuration = Math.round(
                totalMinutes / filteredSessions.length
            );
        }

        return {
            calories,
            distance,
            avgDuration,
        };
    }, [selectedRange]);

    const handleAddSession = () => {
        const duration = calculateDuration(startTime, endTime);
        if (duration <= 0) {
            Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu!");
            return;
        }

        const newSession: DoubleSupportSession = {
            id: Math.random().toString(),
            date: new Date().toISOString().split("T")[0],
            startTime,
            endTime,
            duration,
            activity,
        };

        setSessions([newSession, ...sessions]);
        setModalVisible(false);
        setStartTime("06:00");
        setEndTime("06:30");
        setActivity("Tập luyện");
        Alert.alert("Thành công", "Ghi nhận thời gian tập luyện thành công!");
    };

    // Hàm tính thời lượng từ giờ
    const calculateDuration = (start: string, end: string): number => {
        const [startHour, startMin] = start.split(":").map(Number);
        const [endHour, endMin] = end.split(":").map(Number);
        return (endHour - startHour) * 60 + (endMin - startMin);
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.headerSection}>
                <Text style={styles.headerTitle}>Tập luyện</Text>
            </View>

            {/* Achievement Text */}
            <Text style={styles.achievementText}>
                You have achieved
                <Text style={styles.percentText}> {percentage}% </Text>
                of your goal
            </Text>

            {/* Circular Progress */}
            <View style={styles.circleWrapper}>
                <View style={styles.circleProgressContainer}>
                    <AntDesign name="stepforward" size={32} color="#00BCD4" />
                    <Text style={styles.totalValue}>{total}</Text>
                    <Text style={styles.totalLabel}>
                        minutes out of {goal}
                    </Text>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <AntDesign name="fire" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{statItems.calories}</Text>
                    <Text style={styles.statLabel}>kcal</Text>
                </View>
                <View style={styles.statItem}>
                    <AntDesign name="pushpin" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>{statItems.distance}</Text>
                    <Text style={styles.statLabel}>km</Text>
                </View>
                <View style={styles.statItem}>
                    <AntDesign name="clockcircle" size={24} color="#FF6B35" />
                    <Text style={styles.statValue}>
                        {statItems.avgDuration}
                    </Text>
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

            {/* Add Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <AntDesign name="plus" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Ghi nhận thời gian mới</Text>
            </TouchableOpacity>

            {/* Recent Sessions */}
            <View style={styles.sessionsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Ghi nhận gần đây</Text>
                    <Text style={styles.sessionCount}>
                        {getRangeData(selectedRange).filteredSessions.length}
                    </Text>
                </View>

                {getRangeData(selectedRange).filteredSessions.length > 0 ? (
                    getRangeData(selectedRange)
                        .filteredSessions.slice(0, 5)
                        .map((session) => (
                            <View key={session.id} style={styles.sessionCard}>
                                <View style={styles.sessionLeft}>
                                    <View style={styles.sessionIcon}>
                                        <AntDesign
                                            name="check"
                                            size={18}
                                            color="#fff"
                                        />
                                    </View>
                                    <View style={styles.sessionInfo}>
                                        <Text style={styles.sessionActivity}>
                                            {session.activity}
                                        </Text>
                                        <Text style={styles.sessionTime}>
                                            {session.startTime} -{" "}
                                            {session.endTime}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.sessionRight}>
                                    <Text style={styles.sessionDuration}>
                                        {session.duration}
                                    </Text>
                                    <Text style={styles.sessionDurationLabel}>
                                        phút
                                    </Text>
                                </View>
                            </View>
                        ))
                ) : (
                    <Text style={styles.emptyText}>
                        Chưa có ghi nhận nào
                    </Text>
                )}
            </View>

            {/* Modal thêm phiên */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Ghi nhận hoạt động mới
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                            >
                                <AntDesign name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Loại hoạt động</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Ví dụ: Yoga, Chạy bộ..."
                                value={activity}
                                onChangeText={setActivity}
                            />

                            <Text style={styles.inputLabel}>
                                Thời gian bắt đầu
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="HH:MM"
                                value={startTime}
                                onChangeText={setStartTime}
                            />

                            <Text style={styles.inputLabel}>
                                Thời gian kết thúc
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="HH:MM"
                                value={endTime}
                                onChangeText={setEndTime}
                            />
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleAddSession}
                            >
                                <Text style={styles.submitButtonText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

    // Hàm tính thời lượng từ giờ
    const calculateDuration = (start: string, end: string): number => {
        const [startHour, startMin] = start.split(":").map(Number);
        const [endHour, endMin] = end.split(":").map(Number);
        return (endHour - startHour) * 60 + (endMin - startMin);
    };

    // Hàm thêm phiên mới
    const handleAddSession = () => {
        const duration = calculateDuration(startTime, endTime);
        if (duration <= 0) {
            Alert.alert(
                "Lỗi",
                "Thời gian kết thúc phải sau thời gian bắt đầu!"
            );
            return;
        }

        const newSession: DoubleSupportSession = {
            id: Math.random().toString(),
            date: new Date().toISOString().split("T")[0],
            startTime,
            endTime,
            duration,
            activity,
        };

        setSessions([newSession, ...sessions]);
        setModalVisible(false);
        setStartTime("06:00");
        setEndTime("06:30");
        setActivity("Tập luyện");
        Alert.alert("Thành công", "Ghi nhận thời gian hỗ trợ kép thành công!");
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.headerSection}>
                <Text style={styles.headerTitle}>Thời gian Hỗ trợ Kép</Text>
                <Text style={styles.headerSubtitle}>
                    Theo dõi các hoạt động hỗ trợ sức khỏe
                </Text>
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
                    <AntDesign name="clock-circle" size={24} color="#1976D2" />
                    <Text style={styles.statLabel}>Hôm nay</Text>
                    <Text style={[styles.statValue, { color: "#1976D2" }]}>
                        {todayDuration}
                    </Text>
                    <Text style={styles.statUnit}>phút</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: "#F3E5F5" }]}>
                    <AntDesign name="bar-chart" size={24} color="#7B1FA2" />
                    <Text style={styles.statLabel}>Trung bình</Text>
                    <Text style={[styles.statValue, { color: "#7B1FA2" }]}>
                        {averageSessionDuration}
                    </Text>
                    <Text style={styles.statUnit}>phút</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: "#F1F8E9" }]}>
                    <AntDesign name="fire" size={24} color="#558B2F" />
                    <Text style={styles.statLabel}>Tổng tuần</Text>
                    <Text style={[styles.statValue, { color: "#558B2F" }]}>
                        {totalDuration}
                    </Text>
                    <Text style={styles.statUnit}>phút</Text>
                </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <AntDesign name="plus" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Ghi nhận thời gian mới</Text>
            </TouchableOpacity>

            {/* Recent Sessions */}
            <View style={styles.sessionsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Ghi nhận gần đây</Text>
                    <Text style={styles.sessionCount}>{sessions.length}</Text>
                </View>

                {sessions.length > 0 ? (
                    sessions.slice(0, 5).map((session) => (
                        <View key={session.id} style={styles.sessionCard}>
                            <View style={styles.sessionLeft}>
                                <View style={styles.sessionIcon}>
                                    <AntDesign
                                        name="check"
                                        size={18}
                                        color="#fff"
                                    />
                                </View>
                                <View style={styles.sessionInfo}>
                                    <Text style={styles.sessionActivity}>
                                        {session.activity}
                                    </Text>
                                    <Text style={styles.sessionTime}>
                                        {session.startTime} - {session.endTime}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.sessionRight}>
                                <Text style={styles.sessionDuration}>
                                    {session.duration}
                                </Text>
                                <Text style={styles.sessionDurationLabel}>
                                    phút
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Chưa có ghi nhận nào</Text>
                )}
            </View>

            {/* Modal thêm phiên */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Ghi nhận hoạt động mới
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                            >
                                <AntDesign
                                    name="close"
                                    size={24}
                                    color="#333"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.inputLabel}>
                                Loại hoạt động
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Ví dụ: Yoga, Chạy bộ..."
                                value={activity}
                                onChangeText={setActivity}
                            />

                            <Text style={styles.inputLabel}>
                                Thời gian bắt đầu
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="HH:MM"
                                value={startTime}
                                onChangeText={setStartTime}
                            />

                            <Text style={styles.inputLabel}>
                                Thời gian kết thúc
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="HH:MM"
                                value={endTime}
                                onChangeText={setEndTime}
                            />
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleAddSession}
                            >
                                <Text style={styles.submitButtonText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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

    headerSection: {
        marginBottom: 24,
        paddingTop: 16,
    },

    headerTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#222",
        marginBottom: 4,
    },

    // Achievement Text
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

    // Circular Progress
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

    // Stats Grid
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

    // Range Selector
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

    // Add Button
    addButton: {
        backgroundColor: "#7E4DFF",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginBottom: 24,
        elevation: 3,
    },

    addButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#fff",
    },

    // Sessions Section
    sessionsSection: {
        marginBottom: 24,
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#222",
    },

    sessionCount: {
        fontSize: 14,
        fontWeight: "600",
        color: "#7E4DFF",
        backgroundColor: "#F3E5F5",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },

    sessionCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 1,
    },

    sessionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },

    sessionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#7E4DFF",
        justifyContent: "center",
        alignItems: "center",
    },

    sessionInfo: {
        flex: 1,
    },

    sessionActivity: {
        fontSize: 14,
        fontWeight: "600",
        color: "#222",
    },

    sessionTime: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },

    sessionRight: {
        alignItems: "flex-end",
    },

    sessionDuration: {
        fontSize: 18,
        fontWeight: "800",
        color: "#7E4DFF",
    },

    sessionDurationLabel: {
        fontSize: 11,
        color: "#999",
        marginTop: 2,
    },

    emptyText: {
        textAlign: "center",
        fontSize: 14,
        color: "#999",
        paddingVertical: 20,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },

    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 16,
        minHeight: "60%",
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#222",
    },

    modalBody: {
        marginBottom: 24,
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },

    textInput: {
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 14,
        color: "#222",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },

    modalFooter: {
        flexDirection: "row",
        gap: 12,
        paddingBottom: 20,
    },

    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#F0F0F0",
        alignItems: "center",
    },

    cancelButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },

    submitButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#7E4DFF",
        alignItems: "center",
    },

    submitButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
});
